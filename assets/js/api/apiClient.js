class apiClient {
    scope = '';

    constructor(scope) {
        this.scope = scope;
    }

    loadExisting(callback) {
        if (this.scope === 'ec2') {
            loadExistingEc2().then(response => (callback(response)));
        } else if (this.scope === 'rds') {
            loadExistingRds().then(response => (callback(response)));
        }
    }

    loadItems(callback){
        if (this.scope === 'ec2') {
            loadEc2Configuration().then(response => (callback(response)));
        } else if (this.scope === 'rds') {
            loadRdsConfiguration().then(response => (callback(response)));
        }
    }

    putItem(item,callback){
        if (this.scope === 'ec2') {
            putEc2Item(item).then(response => (callback(response)));
        } else if (this.scope === 'rds') {
            putRdsItem(item).then(response => (callback(response)));
        }
    }

    deleteItem(item,callback){
        if (this.scope === 'ec2') {
            deleteEc2Item(item).then(response => (callback(response)));
        } else if (this.scope === 'rds') {
            deleteRdsItem(item).then(response => (callback(response)));
        }
    }
}