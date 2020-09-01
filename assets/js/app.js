$(document).ready(function () {
    new Vue({
        el: '#app',
        data: {
            scope: 'ec2',
            locales: {
                planning: "",
                button: ""
            }
        },
        mounted() {
            loadLocale("/assets/js").then(response => (this.locales = response.data));
            this.$refs.planning.refresh();
        },
        methods: {
            // Events
            onChangeScope: function (scope) {
                this.scope = scope;
            },
            onRefreshRequest: function () {
                this.$refs.planning.refresh();
            },
            onEditItem: function (item) {
                this.$refs.parameters.edit(item);
            },
            // Methods
            addItem: function () {
                this.$refs.parameters.add();
            }
        }
    });
});

