terraform {
  backend "azurerm" {
    storage_account_name = "tfnewsappstate"
    container_name       = "tfstate"
    key                  = "prod.terraform.tfstate"
  }
}

variable "CLOUDFLARE_EMAIL" {}
variable "CLOUDFLARE_TOKEN" {}

variable "zone" {
  default = "azurenews.pl"
}

variable "FACEBOOKAPPID" {
  type = "string"
}

variable "FACEBOOKAPPSECRET" {
  type = "string"
}

provider "azurerm" {}

provider "cloudflare" {
  email = "${var.CLOUDFLARE_EMAIL}"
  token = "${var.CLOUDFLARE_TOKEN}"
}

resource "cloudflare_zone_settings_override" "zone" {
  name = "${var.zone}"

  settings {
    tls_1_3                  = "on"
    automatic_https_rewrites = "on"
    ssl                      = "full"
  }
}

resource "cloudflare_record" "domain" {
  domain  = "${var.zone}"
  name    = "${terraform.workspace}"
  value   = "${azurerm_function_app.functions.default_hostname}"
  type    = "CNAME"
  proxied = true
}

resource "cloudflare_worker_script" "workerjs" {
  zone    = "${var.zone}"
  content = "${file("worker.js")}"
}

resource "cloudflare_worker_route" "route" {
  zone       = "${var.zone}"
  pattern    = "${terraform.workspace}.${var.zone}/*"
  enabled    = true
  depends_on = ["cloudflare_worker_script.workerjs"]
}

resource "azurerm_resource_group" "rg" {
  name     = "${terraform.workspace}-news-app"
  location = "westeurope"
}

resource "azurerm_application_insights" "appinsights" {
  name                = "${terraform.workspace}-news-ai"
  location            = "${azurerm_resource_group.rg.location}"
  resource_group_name = "${azurerm_resource_group.rg.name}"
  application_type    = "Web"
}

resource "azurerm_storage_account" "storage" {
  name                     = "${terraform.workspace}newssa"
  resource_group_name      = "${azurerm_resource_group.rg.name}"
  location                 = "${azurerm_resource_group.rg.location}"
  account_tier             = "Standard"
  account_kind             = "StorageV2"
  account_replication_type = "RAGRS"
  is_hns_enabled           = "false"
}

resource "azurerm_storage_table" "news" {
  name                 = "news"
  resource_group_name  = "${azurerm_resource_group.rg.name}"
  storage_account_name = "${azurerm_storage_account.storage.name}"
}

resource "azurerm_storage_queue" "news" {
  name                 = "news"
  resource_group_name  = "${azurerm_resource_group.rg.name}"
  storage_account_name = "${azurerm_storage_account.storage.name}"
}

resource "azurerm_app_service_plan" "functions" {
  name                = "${terraform.workspace}-service-plan"
  location            = "${azurerm_resource_group.rg.location}"
  resource_group_name = "${azurerm_resource_group.rg.name}"
  kind                = "FunctionApp"

  sku {
    tier = "Dynamic"
    size = "Y1"
  }
}

resource "azurerm_function_app" "functions" {
  name                      = "${terraform.workspace}-news-functions"
  location                  = "${azurerm_resource_group.rg.location}"
  resource_group_name       = "${azurerm_resource_group.rg.name}"
  app_service_plan_id       = "${azurerm_app_service_plan.functions.id}"
  storage_connection_string = "${azurerm_storage_account.storage.primary_connection_string}"
  version                   = "~2"

  connection_string = [
    {
      name  = "AccountStorage-Conn"
      type  = "Custom"
      value = "${azurerm_storage_account.storage.primary_connection_string}"
    },
  ]

  app_settings = {
    "TableStorage-Name"              = "${azurerm_storage_table.news.name}"
    "Queue-Name"                     = "${azurerm_storage_queue.news.name}"
    "APPINSIGHTS_INSTRUMENTATIONKEY" = "${azurerm_application_insights.appinsights.instrumentation_key}"
    "AccountStorage-Name"            = "${azurerm_storage_account.storage.name}"
  }
}

resource "azurerm_template_deployment" "function-settings" {
  name                = "function-settings"
  resource_group_name = "${azurerm_resource_group.rg.name}"
  deployment_mode     = "Incremental"

  template_body = "${file("function-settings.json")}"

  parameters {
    "name"              = "${azurerm_function_app.functions.name}"
    "facebookAppId"     = "${var.FACEBOOKAPPID}"
    "facebookAppSecret" = "${var.FACEBOOKAPPSECRET}"
  }

  depends_on = [
    "azurerm_function_app.functions",
  ]
}

resource "azurerm_template_deployment" "logicapp" {
  name                = "logicapp"
  resource_group_name = "${azurerm_resource_group.rg.name}"
  deployment_mode     = "Incremental"

  template_body = "${file("logic-apps.json")}"

  parameters {
    "queueApiConnectionName" = "azurequeues"
    "storageAccountName"     = "${azurerm_storage_account.storage.name}"
    "storageAccountKey"      = "${azurerm_storage_account.storage.primary_access_key}"
    "rssApiConnectionName"   = "rss"
    "logicAppName"           = "${terraform.workspace}-news-la-azure-blog"
    "feedUrl"                = "https://azurecomcdn.azureedge.net/en-us/blog/feed/"
  }

  depends_on = [
    "azurerm_storage_queue.news",
  ]
}
