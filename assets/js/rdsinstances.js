let app;

$(document).ready(function () {
    let now = new Date();
    app = new Vue({
        el: '#app',
        data: {
            weekday: now.getDay(),
            menu: [
                {
                    "key": "ec2",
                    "active": false,
                    "link": "/",
                    "label": "EC2 Instances",
                    "title": "EC2 Instances planning"
                },
                {
                    "key": "rds",
                    "active": true,
                    "link": "/rds.html",
                    "label": "RDS Instances",
                    "title": "RDS Instances planning"
                }
            ],
            title: "RDS Instances planning",
            buttonText: "Add RDS Instance",
            items: [],
            openedItem: null,
            existing: null
        },
        mounted() {
            loadRdsConfiguration().then(response => (this.items = response.data.data));
        },
        methods: {
            addInstance: function () {
                this.openedItem = {
                    Name: null,
                    Status: null,
                    active: 1,
                    days: [
                        {start: null, end: null}, // 0
                        {start: null, end: null}, // 1
                        {start: null, end: null}, // 2
                        {start: null, end: null}, // 3
                        {start: null, end: null}, // 4
                        {start: null, end: null}, // 5
                        {start: null, end: null}, // 6
                    ],
                    exception: null,
                    instanceId: null
                };
                $('#parametersModal').modal('show');
                loadExistingRds().then(response => (this.existing = response.data.data));
            },
            deleteInstance: function () {
                deleteRdsItem(this.openedItem).then(response => {
                    $('#parametersModal').modal('hide');
                    loadRdsConfiguration().then(response => (this.items = response.data.data));
                });
            },
            exceptionChange: function () {
                var isChecked = $('#exceptionActive').prop('checked');
                if (isChecked && this.openedItem.exception === null) {
                    this.openedItem.exception = {
                        endDate: (new Date()).toISOString(),
                        startDate: (new Date()).toISOString(),
                        state: 1
                    };
                } else if (isChecked === false && this.openedItem.exception !== null) {
                    this.openedItem.exception = null;
                }
            },
            saveChanges: function () {
                putRdsItem(this.openedItem).then(response => {
                    $('#parametersModal').modal('hide');
                    loadRdsConfiguration().then(response => (this.items = response.data.data));
                });
            },
            openItem: function (instanceId) {
                for (var i = 0; i < this.items.length; i++) {
                    if (this.items[i].instanceId === instanceId) {
                        this.openedItem = this.items[i];
                        break;
                    }
                }
                $('#parametersModal').modal('show');


            }
        }
    });

});

