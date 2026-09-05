module "resource_group" {
  source = "./modules/resource-group"

  project_name = var.project_name
  location     = var.location
  environment  = var.environment

}

module "networking" {
  source = "./modules/networking"

  project_name        = var.project_name
  location            = var.location
  environment         = var.environment
  resource_group_name = module.resource_group.name
}

module "acr" {
  source = "./modules/acr"

  project_name        = var.project_name
  location            = var.location
  environment         = var.environment
  resource_group_name = module.resource_group.name
}

module "aks" {
  source = "./modules/aks"

  project_name        = var.project_name
  location            = var.location
  environment         = var.environment
  resource_group_name = module.resource_group.name
  subnet_id           = module.networking.aks_subnet_id
  acr_id              = module.acr.acr_id
  node_count          = var.aks_node_count
  vm_size             = var.aks_vm_size
}
