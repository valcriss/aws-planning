function loadEc2Configuration() {
    const params = {
        "action": "list-configuration",
        "scope": "ec2"
    };
    return callApi(params);
}

function loadRdsConfiguration() {
    const params = {
        "action": "list-configuration",
        "scope": "rds"
    };
    return callApi(params);
}

function putEc2Item(item) {
    const params = {
        "action": "put-configuration",
        "scope": "ec2",
        "params": item
    };
    return callApi(params);
}

function putRdsItem(item) {
    const params = {
        "action": "put-configuration",
        "scope": "rds",
        "params": item
    };
    return callApi(params);
}

function deleteEc2Item(item){
    const params = {
        "action": "delete-configuration",
        "scope": "ec2",
        "params": item
    };
    return callApi(params);
}

function deleteRdsItem(item){
    const params = {
        "action": "delete-configuration",
        "scope": "rds",
        "params": item
    };
    return callApi(params);
}

function loadExistingEc2()
{
    const params = {
        "action": "list-existing",
        "scope": "ec2"
    };
    return callApi(params);
}

function loadExistingRds()
{
    const params = {
        "action": "list-existing",
        "scope": "rds"
    };
    return callApi(params);
}

function callApi(parameters) {
    return axios.post(API_ENDPOINT, parameters);
}