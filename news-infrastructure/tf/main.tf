terraform {
  backend "azurerm" {
    storage_account_name = "tfnewsappstate"
    container_name       = "tfstate"
    key                  = "prod.terraform.tfstate"
  }
}

variable "FACEBOOKAPPID" {
  type = "string"
}

variable "FACEBOOKAPPSECRET" {
  type = "string"
}

provider "azurerm" {}

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
  name                = "function-settings"
  resource_group_name = "${azurerm_resource_group.rg.name}"
  deployment_mode     = "Incremental"

  template_body = "${file("function-settings.json")}"

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
