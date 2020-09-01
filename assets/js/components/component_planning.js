Vue.component('planning', {
    props: ['scope'],
    data: function () {
        return {
            weekday: dateGetWeekDay(),
            items: [],
        }
    },
    watch: {
        scope: function () {
            this.weekday = dateGetWeekDay();
            this.items = [];
            this.refresh();
        }
    },
    methods: {
        refresh: function () {
            new apiClient(this.scope).loadItems(response => (this.items = response.data.data));
        },
        openItem: function (instanceId) {
            for (let i = 0; i < this.items.length; i++) {
                if (this.items[i].instanceId === instanceId) {
                    this.$emit('edit-item', this.items[i]);
                    break;
                }
            }

        }
    },
    template: '<div><div class="row planning-header">' +
        '            <div class="col-2 text-center">Instance</div>' +
        '            <div class="col text-center" :class="{current: weekday === 1 }">Lundi</div>' +
        '            <div class="col text-center" :class="{current: weekday === 2 }">Mardi</div>' +
        '            <div class="col text-center" :class="{current: weekday === 3 }">Mercredi</div>' +
        '            <div class="col text-center" :class="{current: weekday === 4 }">Jeudi</div>' +
        '            <div class="col text-center" :class="{current: weekday === 5 }">Vendredi</div>' +
        '            <div class="col text-center" :class="{current: weekday === 6 }">Samedi</div>' +
        '            <div class="col text-center" :class="{current: weekday === 0 }">Dimanche</div>' +
        '            <div class="col text-center">Statut</div>' +
        '        </div>' +
        '        <div v-if="items.length===0">' +
        '            <div class="row planning-item">' +
        '                <div class="col text-center">Aucune instance configurée</div>' +
        '            </div>' +
        '        </div>' +
        '        <div v-if="items.length>0" v-for="item in items" :key="item.instanceId">' +
        '            <div class="row planning-item">' +
        '                <div class="col-2 text-center planning-item-name" @click="openItem(item.instanceId)">{{ item.Name }}</div>' +
        '                <div class="col text-center" :class="{current: weekday === 1 }">{{ item.days[1].start ===null && item.days[1].end === null ? "Stopped" : item.days[1].start }} {{ item.days[1].end }}</div>' +
        '                <div class="col text-center" :class="{current: weekday === 2 }">{{ item.days[2].start ===null && item.days[2].end === null ? "Stopped" : item.days[2].start }} {{ item.days[2].end }}</div>' +
        '                <div class="col text-center" :class="{current: weekday === 3 }">{{ item.days[3].start ===null && item.days[3].end === null ? "Stopped" : item.days[3].start }} {{ item.days[3].end }}</div>' +
        '                <div class="col text-center" :class="{current: weekday === 4 }">{{ item.days[4].start ===null && item.days[4].end === null ? "Stopped" : item.days[4].start }} {{ item.days[4].end }}</div>' +
        '                <div class="col text-center" :class="{current: weekday === 5 }">{{ item.days[5].start ===null && item.days[5].end === null ? "Stopped" : item.days[5].start }} {{ item.days[5].end }}</div>' +
        '                <div class="col text-center" :class="{current: weekday === 6 }">{{ item.days[6].start ===null && item.days[6].end === null ? "Stopped" : item.days[6].start }} {{ item.days[6].end }}</div>' +
        '                <div class="col text-center" :class="{current: weekday === 0 }">{{ item.days[0].start ===null && item.days[0].end === null ? "Stopped" : item.days[0].start }} {{ item.days[0].end }}</div>' +
        '                <div class="col text-center">' +
        '                    <span class="badge badge-pill badge-success">{{ item.Status }}</span>' +
        '                </div>' +
        '            </div>' +
        '            <div v-if="item.exception !== null" class="row planning-item-exception">' +
        '                <div class="col text-center">&nbsp;</div>' +
        '                <div v-if="item.exception.state === 1" class="col-7 text-center">Instance available from {{ item.exception.startDate }} {{ item.exception.startTime }} to {{ item.exception.endDate }} {{ item.exception.endTime }}</div>' +
        '                <div v-else class="col-7 text-center">Instance not available from {{ item.exception.startDate }} {{ item.exception.startTime }} to {{ item.exception.endDate }} {{ item.exception.endTime }}</div>' +
        '                <div class="col text-center">&nbsp;</div>' +
        '            </div>' +
        '        </div></div>'
})