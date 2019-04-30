isError=0
for template in $(ls *.json)
do
    echo Validating ARM Template: $template
    error=$(az group deployment validate --resource-group dev --template-file $template --query "error")
    if [ ! -z "$error" ]; then
        echo $error
        isError=1
    fi
done

if [ $isError -eq 1 ]; then
    echo "There is an error" > /dev/stderr
    exit 1
fi
