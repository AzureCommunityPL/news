isError=0
reserved=( "metadata.json" )
for template in $(ls *.json)
do
    if [[ $(printf "_[%s]_" "${reserved[@]}") =~ .*_\[$template\]_.* ]]; then 
        echo "$template is present on a reserved filenames list, won't be validated";
        continue
    fi

    echo Validating ARM Template: $template
    error=$(az group deployment validate --resource-group dev-news-app --template-file $template --query "error")
    if [ ! -z "$error" ]; then
        echo $error
        isError=1
    fi
done

if [ $isError -eq 1 ]; then
    echo "There is an error">&2
    exit 1
fi
