Vue.component('nav-bar', {
    props: ['scope'],
    data: function () {
        return {
            current: this.scope,
            items: [
                {
                    "key": "ec2",
                    "label": "EC2 Instances",
                },
                {
                    "key": "rds",
                    "label": "RDS Instances",
                }
            ],
            locales: {
                instances: "",
            }
        }
    },
    mounted() {
        loadLocale("/assets/js/components/navbar").then(response => (this.locales = response.data));
    },
    watch: {
        scope: function () {
            this.current = this.scope;
        }
    },
    methods: {
        changeScope: function (scope) {
            if (scope !== this.current) {
                this.current = scope;
                this.$emit('scope-changed', scope);
            }
        }
    },
    template: '<nav class="navbar navbar-expand-lg navbar-dark bg-dark">' +
        '        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo01" aria-controls="navbarTogglerDemo01" aria-expanded="false" aria-label="Toggle navigation">' +
        '            <span class="navbar-toggler-icon"></span>' +
        '        </button>' +
        '        <div class="collapse navbar-collapse" id="navbarTogglerDemo01">' +
        '            <a class="navbar-brand" href="#">AWS Planning</a>' +
        '            <ul class="navbar-nav mr-auto mt-2 mt-lg-0">' +
        '                <li class="nav-item" v-for="item in items" :key="item.key" :class="{ active: item.key === current }">' +
        '                    <a class="nav-link" href="#" @click="changeScope(item.key)">{{ locales.instances.replace("--key--",item.key.toUpperCase()) }}</a>' +
        '                </li>' +
        '            </ul>' +
        '        </div>' +
        '    </nav>'
})