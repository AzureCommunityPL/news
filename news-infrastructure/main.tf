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

variable "cf_account_id" {
  "default" = "d5b58a2229c11224b000073d2b8e33d3"
  type      = "string"
}

variable "cf_namespace_name" {
  default = "406394498dec4b9eaeb3d096ab886219"
  type    = "string"
}

variable "cloudflare_record_name" {
  type = "map"

  default = {
    prod = "@"
  }
}

provider "azurerm" {}

provider "cloudflare" {
  email = "${var.CLOUDFLARE_EMAIL}"
  token = "${var.CLOUDFLARE_TOKEN}"
}

data "cloudflare_zones" "zone" {
  filter {
    name   = "${var.zone}"
    status = "active"
    paused = false
  }
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
  name    = "${lookup(var.cloudflare_record_name, terraform.workspace, terraform.workspace)}"
  value   = "${azurerm_function_app.functions.default_hostname}"
  type    = "CNAME"
  proxied = true
}

resource "null_resource" "cloudflare_worker" {
  triggers {
    build_number = "${timestamp()}"
  }

  provisioner "local-exec" {
    command = <<REQUEST
curl -X PUT "https://api.cloudflare.com/client/v4/zones/40807004102a697a69f83bf88f26b64f/workers/script" \
  -H "X-Auth-Email: ${var.CLOUDFLARE_EMAIL}" \
  -H "X-Auth-Key: ${var.CLOUDFLARE_TOKEN}" \
  -F "metadata=@metadata.json;type=application/json" \
  -F "script=@worker.js;type=application/javascript"
REQUEST
  }
}

resource "cloudflare_worker_route" "route" {
  zone       = "${var.zone}"
  pattern    = "${terraform.workspace}.${var.zone}/*"
  enabled    = true
  depends_on = ["null_resource.cloudflare_worker"]
}

resource "null_resource" "cloudflare_kv_settings" {
  triggers {
    build_number = "${timestamp()}"
  }

  provisioner "local-exec" {
    command = <<REQUEST
curl "https://api.cloudflare.com/client/v4/accounts/${var.cf_account_id}/storage/kv/namespaces/${var.cf_namespace_name}/values/${terraform.workspace}" \
-X PUT \
-H "X-Auth-Email: ${var.CLOUDFLARE_EMAIL}" \
-H "X-Auth-Key: ${var.CLOUDFLARE_TOKEN}" \
--data '{
	"api": "${azurerm_function_app.functions.default_hostname}",
	"spa" : "${azurerm_storage_account.storage.primary_web_host}",
	"storage" : "${azurerm_storage_account.storage.primary_table_host}"
    }'
REQUEST
  }
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

resource "azurerm_storage_table" "comments" {
  name                 = "comments"
  resource_group_name  = "${azurerm_resource_group.rg.name}"
  storage_account_name = "${azurerm_storage_account.storage.name}"
}

resource "azurerm_storage_table" "likes" {
  name                 = "likes"
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
    "APPINSIGHTS_INSTRUMENTATIONKEY" = "${azurerm_application_insights.appinsights.instrumentation_key}"
    "AccountStorage-Name"            = "${azurerm_storage_account.storage.name}"
    "WEBSITE_RUN_FROM_PACKAGE"       = "1"
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
    "logicAppName"           = "${terraform.workspace}-news-la"
    "feedUrlList"            = "https://azurecomcdn.azureedge.net/en-us/blog/feed/"
  }

  depends_on = [
    "azurerm_storage_queue.news",
  ]
}
