/*******************************************************************************/
// CONFIGURATION
/*******************************************************************************/
var configuration = {
    AWS_S3Bucket: "app-deploy.ptech.fr",
    AWS_S3ConfigurationFile: "configuration.json",
    AWS_Region: "eu-west-1",
    DryRun: true,
    TimeZone: "Europe/Paris",
}

/*******************************************************************************/

var configurationFileParams = {
    Bucket: configuration.AWS_S3Bucket,
    Key: configuration.AWS_S3ConfigurationFile,
};
var dryRun = configuration.DryRun;
process.env.TZ = configuration.TimeZone
var aws = require('aws-sdk');
aws.config.region = configuration.AWS_Region;
var ec2 = new aws.EC2();
var rds = new aws.RDS();
var s3 = new aws.S3();

exports.handler = async (event) => {

    let body;
    let response = null;

    if (event.hasOwnProperty('body')) {
        body = JSON.parse(event.body);
    } else {
        body = event;
    }

    if (body.hasOwnProperty('action') && body.hasOwnProperty('scope')) {
        switch (body.action) {
            case 'list-configuration':
                response = listConfiguration(body.scope);
                break;
            case 'put-configuration':
                response = putConfiguration(body.scope, body.params);
                break;
            case 'delete-configuration':
                response = deleteConfiguration(body.scope, body.params);
                break;
            case 'list-existing':
                response = listExisting(body.scope);
                break;
        }
    } else {
        response = checkInstances();
    }

    console.log(response);

    return response;
};

/*******************************************************************************
 * Scope handler functions
 * ****************************************************************************/

function listConfiguration(scope) {
    switch (scope) {
        case 'ec2':
            return listConfigurationEc2();
        case 'rds':
            return listConfigurationRds();
    }
    return responseError("Bad scope");
}

function putConfiguration(scope, params) {
    switch (scope) {
        case 'ec2':
            return putConfigurationEc2(params);
        case 'rds':
            return putConfigurationRds(params);
    }
    return responseError("Bad scope");
}

function deleteConfiguration(scope, params) {
    switch (scope) {
        case 'ec2':
            return deleteConfigurationEc2(params);
        case 'rds':
            return deleteConfigurationRds(params);
    }
    return responseError("Bad scope");
}

function listExisting(scope) {
    switch (scope) {
        case 'ec2':
            return listExistingEc2().then(function (value) {
                return responseSuccess(value);
            });
        case 'rds':
            return listExistingRds().then(function (value) {
                return responseSuccess(value);
            });
    }
    return responseError("Bad scope");
}

function checkInstances() {
    let orders = [];

    return checkEc2Instances(orders).then(function (orders) {
        return checkRdsInstances(orders);
    }).then(function (orders) {
        return responseSuccess(orders);
    });
}

/*******************************************************************************
 * EC2
 * ****************************************************************************/

function checkEc2Instances(orders) {
    return new Promise(function (resolve) {

        listConfigurationEc2().then(function (ec2) {
            ec2 = JSON.parse(ec2.body).data;
            for (let i = 0; i < ec2.length; i++) {
                let currentDesiredState = desiredState(ec2[i]);

                if (currentDesiredState !== ec2[i].Status && currentDesiredState === "STOPPED" && ec2[i].Status === "RUNNING") {
                    orders.push({"scope": "ec2", "instanceId": ec2[i].instanceId, "order": "stop"});
                    stopEc2Instance(ec2[i].instanceId);
                } else if (currentDesiredState !== ec2[i].Status && currentDesiredState === "RUNNING" && ec2[i].Status === "STOPPED") {
                    orders.push({"scope": "ec2", "instanceId": ec2[i].instanceId, "order": "start"});
                    startEc2Instance(ec2[i].instanceId);
                }
            }
            return resolve(orders);
        });

    });
}

async function startEc2Instance(instanceId) {
    if (dryRun) return true;
    var params = {
        InstanceIds: [instanceId]
    };
    await ec2.startInstances(params, function (err) {
        if (err) console.log(err, err.stack);
    });
}

async function stopEc2Instance(instanceId) {
    if (dryRun) return true;
    var params = {
        InstanceIds: [instanceId]
    };
    await ec2.stopInstances(params, function (err) {
        if (err) console.log(err, err.stack);
    });
}

function listExistingEc2() {
    return new Promise(function (resolve) {
        ec2.describeInstances({}, function (err, data) {
            if (err) console.log(err, err.stack);
            else {
                var instances = [];
                for (var i in data.Reservations) {
                    for (var j in data.Reservations[i].Instances) {
                        var instanceid = data.Reservations[i].Instances[j].InstanceId;

                        for (var k in data.Reservations[i].Instances[j].Tags) {
                            if (data.Reservations[i].Instances[j].Tags[k].Key === 'Name') {
                                var name = data.Reservations[i].Instances[j].Tags[k].Value;
                                instances.push({instanceId: instanceid, Name: name});
                            }
                        }
                    }
                }
                resolve(instances); // here lamda exits
            }
        });

    })
}

function putConfigurationEc2(params) {
    return new Promise(function (resolve) {

        loadConfigurationFromFile().then(function (values) {
            return updateConfigurationEc2(values, params);
        }).then(function (values) {
            return putConfigurationIntoFile(values);
        }).then(function () {
            resolve(listConfigurationEc2());
        });

    });
}

function deleteConfigurationEc2(params) {
    return new Promise(function (resolve) {

        loadConfigurationFromFile().then(function (values) {
            return cleanConfigurationEc2(values, params);
        }).then(function (values) {
            return putConfigurationIntoFile(values);
        }).then(function () {
            resolve(listConfigurationEc2());
        });

    });
}

function listConfigurationEc2() {
    return new Promise(function (resolve) {

        loadConfigurationFromFile().then(function (values) {
            return describeEc2instance(values);
        }).then(function (values) {
            resolve(responseSuccess(values.ec2));
        });
    });
}

function updateConfigurationEc2(values, params) {

    for (let i = 0; i < params.days.length; i++) {
        if (params.days[i].start === "" || params.days[i].end === "") {
            params.days[i].start = null;
            params.days[i].end = null;
        }
    }

    let found = false;
    for (let n = 0; n < values.ec2.length; n++) {
        if (values.ec2[n].instanceId === params.instanceId) {
            found = true;
            values.ec2[n] = params;
        }
    }

    if (found === false) {
        values.ec2.push(params);
    }

    return values;
}

function cleanConfigurationEc2(values, params) {
    var targets = [];
    for (var n = 0; n < values.ec2.length; n++) {
        if (values.ec2[n].instanceId === params.instanceId) continue;
        targets.push(values.ec2[n]);
    }
    values.ec2 = targets;
    return values;
}

function describeEc2instance(values) {
    var instanceIds = [];
    for (var i = 0; i < values.ec2.length; i++) {
        instanceIds.push(values.ec2[i].instanceId);
    }
    if (instanceIds.length === 0) return values;

    return new Promise(function (resolve) {
        var params = {
            InstanceIds: instanceIds
        };
        ec2.describeInstances(params, function (err, data) {
            if (err) {
                console.log(err, err.stack);
                resolve(null);
            } else {

                let i;
                let instances = [];
                for (i in data.Reservations) {
                    for (let j in data.Reservations[i].Instances) {
                        let instanceid = data.Reservations[i].Instances[j].InstanceId;
                        let state = data.Reservations[i].Instances[j].State.Name.toUpperCase();

                        let name = null;
                        for (var k in data.Reservations[i].Instances[j].Tags) {
                            if (data.Reservations[i].Instances[j].Tags[k].Key === 'Name') {
                                name = data.Reservations[i].Instances[j].Tags[k].Value;
                                break;
                            }
                        }
                        instances.push({instanceId: instanceid, State: state, Name: name});
                    }
                }

                for (i = 0; i < values.ec2.length; i++) {
                    const instanceId = values.ec2[i].instanceId;
                    for (let n = 0; n < instances.length; n++) {
                        if (instances[n].instanceId === instanceId) {
                            values.ec2[i]['Name'] = instances[n].Name;
                            values.ec2[i]['Status'] = instances[n].State;
                        }
                    }
                }

                resolve(values);
            }
        });

    });
}

/*******************************************************************************
 * RDS
 * ****************************************************************************/

function checkRdsInstances(orders) {
    return new Promise(function (resolve) {

        listConfigurationRds().then(function (rds) {
            rds = JSON.parse(rds.body).data;
            for (var i = 0; i < rds.length; i++) {
                var currentDesiredState = desiredState(rds[i]);
                if (currentDesiredState !== rds[i].Status && currentDesiredState === "STOPPED" && rds[i].Status === "AVAILABLE") {
                    orders.push({"scope": "rds", "instanceId": rds[i].instanceId, "order": "stop"});
                    stopRdsInstance(rds[i].instanceId);
                } else if (currentDesiredState !== rds[i].Status && currentDesiredState === "RUNNING" && rds[i].Status === "STOPPED") {
                    orders.push({"scope": "rds", "instanceId": rds[i].instanceId, "order": "start"});
                    startRdsInstance(rds[i].instanceId);
                }
            }
            return resolve(orders);
        });

    });
}

async function startRdsInstance(instanceId) {
    if (dryRun) return true;
    var params = {
        DBInstanceIdentifier: instanceId
    };
    await rds.startDBInstance(params, function (err, data) {
        if (err) console.log(err, err.stack);
    });
}

async function stopRdsInstance(instanceId) {
    if (dryRun) return true;
    var params = {
        DBInstanceIdentifier: instanceId
    };
    await rds.stopDBInstance(params, function (err, data) {
        if (err) console.log(err, err.stack);
    });
}

function listExistingRds() {
    return new Promise(function (resolve) {
        rds.describeDBInstances({}, function (err, data) {
            if (err) console.log(err, err.stack);
            else {
                var instances = [];

                for (var i in data.DBInstances) {
                    var instanceid = data.DBInstances[i].DBInstanceIdentifier;
                    var name = data.DBInstances[i].DBInstanceIdentifier;
                    instances.push({instanceId: instanceid, Name: name});
                }
                resolve(instances); // here lamda exits
            }
        });

    })
}

function describeRdsinstance(values) {
    var instanceIds = [];
    for (var i = 0; i < values.rds.length; i++) {
        instanceIds.push(values.rds[i].instanceId);
    }
    if (instanceIds.length === 0) return values;

    return new Promise(function (resolve) {
        var params = {
            Filters: [{
                Name: 'db-instance-id',
                Values: instanceIds
            }]
        };
        rds.describeDBInstances(params, function (err, data) {
            if (err) {
                console.log(err, err.stack);
                resolve(null);
            } else {

                var instances = [];
                for (var i in data.DBInstances) {
                    var instanceid = data.DBInstances[i].DBInstanceIdentifier;
                    var name = data.DBInstances[i].DBInstanceIdentifier;
                    var state = data.DBInstances[i].DBInstanceStatus.toUpperCase();
                    instances.push({instanceId: instanceid, State: state, Name: name});
                }

                for (var i = 0; i < values.rds.length; i++) {
                    var instanceId = values.rds[i].instanceId;
                    for (var n = 0; n < instances.length; n++) {
                        if (instances[n].instanceId === instanceId) {
                            values.rds[i]['Name'] = instances[n].Name;
                            values.rds[i]['Status'] = instances[n].State;
                        }
                    }
                }

                resolve(values);
            }
        });

    });
}

function listConfigurationRds() {
    const promise = new Promise(function (resolve, reject) {

        loadConfigurationFromFile().then(function (values) {
            return describeRdsinstance(values);
        }).then(function (value) {
            resolve(responseSuccess(value.rds));
        });

    });

    return promise;
}

function updateConfigurationRds(values, params) {
    for (let i = 0; i < params.days.length; i++) {
        if (params.days[i].start === "" || params.days[i].end === "") {
            params.days[i].start = null;
            params.days[i].end = null;
        }
    }
    var found = false;
    for (var n = 0; n < values.rds.length; n++) {
        if (values.rds[n].instanceId === params.instanceId) {
            found = true;
            values.rds[n] = params;
        }
    }

    if (found === false) {
        values.rds.push(params);
    }

    return values;
}

function deleteConfigurationRds(params) {
    const promise = new Promise(function (resolve, reject) {

        loadConfigurationFromFile().then(function (values) {
            return cleanConfigurationRds(values, params);
        }).then(function (values) {
            return putConfigurationIntoFile(values);
        }).then(function (values) {
            resolve(listConfigurationRds());
        });

    });

    return promise;
}

function cleanConfigurationRds(values, params) {
    var targets = [];
    for (var n = 0; n < values.rds.length; n++) {
        if (values.rds[n].instanceId === params.instanceId) continue;
        targets.push(values.rds[n]);
    }
    values.rds = targets;
    return values;
}

function putConfigurationRds(params) {
    return new Promise(function (resolve, reject) {

        loadConfigurationFromFile().then(function (values) {
            return updateConfigurationRds(values, params);
        }).then(function (values) {
            return putConfigurationIntoFile(values);
        }).then(function (values) {
            resolve(listConfigurationRds());
        });

    });
}

/*******************************************************************************
 * COMMON
 * ****************************************************************************/

function desiredState(item) {
    var desiredFromPlanning = desiredStateFromPlanning(item);
    var desiredFromException = desiredStateFromException(item);
    if (desiredFromException !== desiredFromPlanning && desiredFromException !== "NONE") {
        return desiredFromException;
    }
    return desiredFromPlanning;
}

function desiredStateFromPlanning(item) {
    var d = (new Date());
    var weekDay = d.getDay();

    var dayConf = item.days[weekDay];
    if (dayConf.start === null || dayConf.end === null) return "STOPPED";
    let startHour = dayConf.start.substr(0, 2);
    let startMinuts = dayConf.start.substr(3, 2);
    let endHour = dayConf.end.substr(0, 2);
    let endMinuts = dayConf.end.substr(3, 2);

    let startIndex = (Number(startHour) * 60) + Number(startMinuts);
    let endIndex = (Number(endHour) * 60) + Number(endMinuts);
    let currentIndex = (Number(d.getHours()) * 60) + Number(d.getMinutes());

    if (currentIndex < startIndex || currentIndex >= endIndex) return "STOPPED";

    return "RUNNING";
}

function desiredStateFromException(item) {
    if (item.exception !== null) {
        if (item.exception.startDate === null || item.exception.endDate === null || item.exception.startTime === null || item.exception.endTime === null) {
            return "NONE";
        }
        var d = (new Date());

        let startIndex = Number(item.exception.startDate.replace("-", ""));
        let endIndex = Number(item.exception.endDate.replace("-", ""));
        let currentIndex = Number(d.toISOString().split('T')[0].replace("-", ""));

        if (currentIndex < startIndex || currentIndex >= endIndex) return "NONE";

        let startHour = item.exception.startTime.substr(0, 2);
        let startMinuts = item.exception.startTime.substr(3, 2);
        let endHour = item.exception.endTime.substr(0, 2);
        let endMinuts = item.exception.endTime.substr(3, 2);

        let startTimeIndex = (Number(startHour) * 60) + Number(startMinuts);
        let endTimeIndex = (Number(endHour) * 60) + Number(endMinuts);
        let currentTimeIndex = (Number(d.getHours()) * 60) + Number(d.getMinutes());

        if (currentTimeIndex < startTimeIndex || currentTimeIndex >= endTimeIndex) return "NONE";

        return (item.exception.state === 1) ? "RUNNING" : "STOPPED";
    }
    return "NONE";
}

function loadConfigurationFromFile() {
    return new Promise(function (resolve, reject) {
        s3.getObject(configurationFileParams, function (err, data) {
            if (err) {
                resolve({ec2: [], rds: []});
            } else {
                resolve(JSON.parse(data.Body));
            }
        });
    });
}

function putConfigurationIntoFile(configuration) {
    var params = {
        Body: JSON.stringify(configuration),
        Bucket: configurationFileParams.Bucket,
        Key: configurationFileParams.Key,
    };
    return s3.putObject(params).promise();
}

function responseSuccess(data) {
    return {
        "isBase64Encoded": false,
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
            "ProcessTime": (new Date()).toLocaleString()
        },
        "body": JSON.stringify({
            result: true,
            data: data,
            error: null
        })
    };
}

function responseError(error) {
    return {
        "isBase64Encoded": false,
        "statusCode": 400,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true
        },
        "body": JSON.stringify({
            result: false,
            data: null,
            error: error
        })
    };
}