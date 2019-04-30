az account set -s "AzureCommunityPL/news"
export ARM_ACCESS_KEY=$(az storage account keys list -g tf -n tfnewsappstate --query "[0].value" -o tsv)