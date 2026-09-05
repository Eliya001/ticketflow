resource "azurerm_container_registry" "this" {
  name                = "acr${var.project_name}${var.environment}eliya"
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = "Basic"
  admin_enabled       = false

  tags = {
    project     = var.project_name
    environment = var.environment
    managed_by  = "terraform" 
  } 
}
