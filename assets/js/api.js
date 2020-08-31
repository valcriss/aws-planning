var API_ENDPOINT = "https://mljaenbgr6.execute-api.eu-west-1.amazonaws.com/PROD";

function loadEc2Configuration() {
    var params = {
        "action": "list-configuration",
        "scope": "ec2"
    };
    return callApi(params);
}

function loadRdsConfiguration() {
    var params = {
        "action": "list-configuration",
        "scope": "rds"
    };
    return callApi(params);
}

function putEc2Item(item) {
    var params = {
        "action": "put-configuration",
        "scope": "ec2",
        "params": item
    };
    return callApi(params);
}

function putRdsItem(item) {
    var params = {
        "action": "put-configuration",
        "scope": "rds",
        "params": item
    };
    return callApi(params);
}

function deleteEc2Item(item){
    var params = {
        "action": "delete-configuration",
        "scope": "ec2",
        "params": item
    };
    return callApi(params);
}

function deleteRdsItem(item){
    var params = {
        "action": "delete-configuration",
        "scope": "rds",
        "params": item
    };
    return callApi(params);
}

function loadExistingEc2()
{
    var params = {
        "action": "list-existing",
        "scope": "ec2"
    };
    return callApi(params);
}

function loadExistingRds()
{
    var params = {
        "action": "list-existing",
        "scope": "rds"
    };
    return callApi(params);
}

function callApi(parameters) {
    return axios.post(API_ENDPOINT, parameters);
}