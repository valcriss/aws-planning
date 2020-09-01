Vue.component('parameters', {
    props: ['scope'],
    data: function () {
        return {
            openedItem: null,
            existing: null,
        }
    },
    watch: {
        scope: function () {
            this.openedItem = null;
            this.existing = null;
        },
        openedItem: {
            handler() {
                if (this.openedItem === null || this.openedItem.instanceId === null) {
                    this.lock();
                } else {
                    this.unLock();
                }
            },
            deep: true
        }
    },
    methods: {
        add: function () {
            this.openedItem = createEmptyItem();
            this.existing = null;
            this.show();
            new apiClient(this.scope).loadExisting(response => (this.existing = response.data.data));
        },
        edit: function (item) {
            this.openedItem = item;
            this.existing = null;
            this.show();
        },
        lock: function () {
            $('#saveItemButton').prop('disabled', true);
        },
        unLock: function () {
            $('#saveItemButton').prop('disabled', false);
        },
        show: function () {
            $('#parametersModal').modal('show');
        },
        hide: function () {
            $('#parametersModal').modal('hide');
        },
        deleteItem: function () {
            new apiClient(this.scope).deleteItem(this.openedItem, () => (this.$emit('refresh-request')));
            this.hide();
        },
        saveItem: function () {
            new apiClient(this.scope).putItem(this.openedItem, () => (this.$emit('refresh-request')));
            this.hide();
        },
        exceptionChange: function () {
            var isChecked = $('#exceptionActive').prop('checked');
            if (isChecked && this.openedItem.exception === null) {
                this.openedItem.exception = {
                    endDate: dateGetCurrentIsoDate(),
                    startDate: dateGetCurrentIsoDate(),
                    state: 1
                };
            } else if (isChecked === false && this.openedItem.exception !== null) {
                this.openedItem.exception = null;
            }
        }
    },
    template: '<div class="modal fade" id="parametersModal" tabindex="-1" role="dialog" aria-labelledby="parametersModalTitle" aria-hidden="true">' +
        '        <div class="modal-dialog modal-lg modal-dialog-centered" role="document">' +
        '            <div class="modal-content">' +
        '                <div class="modal-header">' +
        '                    <h5 class="modal-title" id="parametersModalTitle">Planning Parameters</h5>' +
        '                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
        '                        <span aria-hidden="true">&times;</span>' +
        '                    </button>' +
        '                </div>' +
        '                <div class="modal-body">' +
        '                    <div v-if="openedItem === null">' +
        '                        <img class="spinner" width="102" src="/assets/images/spinner.gif" alt=""/>' +
        '                    </div>' +
        '                    <div v-else>' +
        '                        <form>' +
        '                            <input type="hidden" id="instanceId" v-model="openedItem.instanceId">' +
        '                            <div class="form-group row">' +
        '                                <label class="col-sm-3 col-form-label">Instance</label>' +
        '                                <div class="col-sm-9" v-if="openedItem.Name !== null">' +
        '                                    <input type="text" readonly class="form-control-plaintext" v-model="openedItem.Name">' +
        '                                </div>' +
        '                                <div class="col-sm-9" v-if="openedItem.Name === null">' +
        '                                    <input type="text" readonly class="form-control-plaintext" v-if="existing === null" value="Chargement en cours...">' +
        '                                    <select class="form-control" v-if="existing !== null" v-model="openedItem.instanceId">' +
        '                                        <option v-for="existingItem in existing" :value="existingItem.instanceId">' +
        '                                            {{ existingItem.Name }}' +
        '                                        </option>' +
        '                                    </select>' +
        '                                </div>' +
        '                            </div>' +
        '                            <hr/>' +
        '                            <div class="form-group row">' +
        '                                <label class="col-sm-3 col-form-label">Lundi</label>' +
        '                                <div class="col-sm-3">' +
        '                                    <input type="time" class="form-control" id="days[1][start]" v-model="openedItem.days[1].start" >' +
        '                                </div>' +
        '                                <div class="col-sm-3">' +
        '                                    <input type="time" class="form-control" id="days[1][end]" v-model="openedItem.days[1].end" >' +
        '                                </div>' +
        '                            </div>' +
        '                            <div class="form-group row">' +
        '                                <label class="col-sm-3 col-form-label">Mardi</label>' +
        '                                <div class="col-sm-3">' +
        '                                    <input type="time" class="form-control" id="days[2][start]" v-model="openedItem.days[2].start" >' +
        '                                </div>' +
        '                                <div class="col-sm-3">' +
        '                                    <input type="time" class="form-control" id="days[2][end]" v-model="openedItem.days[2].end" >' +
        '                                </div>' +
        '                            </div>' +
        '                            <div class="form-group row">' +
        '                                <label class="col-sm-3 col-form-label">Mercredi</label>' +
        '                                <div class="col-sm-3">' +
        '                                    <input type="time" class="form-control" id="days[3][start]" v-model="openedItem.days[3].start" >' +
        '                                </div>' +
        '                                <div class="col-sm-3">' +
        '                                    <input type="time" class="form-control" id="days[3][end]" v-model="openedItem.days[3].end" >' +
        '                                </div>' +
        '                            </div>' +
        '                            <div class="form-group row">' +
        '                                <label class="col-sm-3 col-form-label">Jeudi</label>' +
        '                                <div class="col-sm-3">' +
        '                                    <input type="time" class="form-control" id="days[4][start]" v-model="openedItem.days[4].start" >' +
        '                                </div>' +
        '                                <div class="col-sm-3">' +
        '                                    <input type="time" class="form-control" id="days[4][end]" v-model="openedItem.days[4].end" >' +
        '                                </div>' +
        '                            </div>' +
        '                            <div class="form-group row">' +
        '                                <label class="col-sm-3 col-form-label">Vendredi</label>' +
        '                                <div class="col-sm-3">' +
        '                                    <input type="time" class="form-control" id="days[5][start]" v-model="openedItem.days[5].start" >' +
        '                                </div>' +
        '                                <div class="col-sm-3">' +
        '                                    <input type="time" class="form-control" id="days[5][end]" v-model="openedItem.days[5].end" >' +
        '                                </div>' +
        '                            </div>' +
        '                            <div class="form-group row">' +
        '                                <label class="col-sm-3 col-form-label">Samedi</label>' +
        '                                <div class="col-sm-3">' +
        '                                    <input type="time" class="form-control" id="days[6][start]" v-model="openedItem.days[6].start" >' +
        '                                </div>' +
        '                                <div class="col-sm-3">' +
        '                                    <input type="time" class="form-control" id="days[6][end]" v-model="openedItem.days[6].end" >' +
        '                                </div>' +
        '                            </div>' +
        '                            <div class="form-group row">' +
        '                                <label class="col-sm-3 col-form-label">Dimanche</label>' +
        '                                <div class="col-sm-3">' +
        '                                    <input type="time" class="form-control" id="days[0][start]" v-model="openedItem.days[0].start" >' +
        '                                </div>' +
        '                                <div class="col-sm-3">' +
        '                                    <input type="time" class="form-control" id="days[0][end]" v-model="openedItem.days[0].end" >' +
        '                                </div>' +
        '                            </div>' +
        '                            <hr/>' +
        '                            <div class="form-group row">' +
        '                                <label class="col-sm-3 col-form-label">Exception</label>' +
        '                                <div class="col-sm-6">' +
        '                                    <div class="form-check">' +
        '                                        <input id="exceptionActive" class="form-check-input" type="checkbox" @change="exceptionChange()" :checked="openedItem.exception !== null ? \'checked\' : null">' +
        '                                    </div>' +
        '                                </div>' +
        '                            </div>' +
        '                            <div v-if="openedItem.exception !== null" class="form-group row">' +
        '                                <label class="col-sm-3 col-form-label">Statut</label>' +
        '                                <div class="col-sm-6">' +
        '                                    <select id="state" class="form-control" v-model="openedItem.exception.state">' +
        '                                        <option value="1">Instance allumée</option>' +
        '                                        <option value="0">Instance éteinte</option>' +
        '                                    </select>' +
        '                                </div>' +
        '                            </div>' +
        '                            <div v-if="openedItem.exception !== null" class="form-group row">' +
        '                                <label class="col-sm-3 col-form-label">Début</label>' +
        '                                <div class="col-sm-4">' +
        '                                    <input type="date" class="form-control" v-model="openedItem.exception.startDate" />' +
        '                                </div>' +
        '                                <div class="col-sm-4">' +
        '                                    <input type="time" class="form-control" v-model="openedItem.exception.startTime" />' +
        '                                </div>' +
        '                            </div>' +
        '                            <div v-if="openedItem.exception !== null" class="form-group row">' +
        '                                <label class="col-sm-3 col-form-label">Fin</label>' +
        '                                <div class="col-sm-4">' +
        '                                    <input type="date" class="form-control" v-model="openedItem.exception.endDate" />' +
        '                                </div>' +
        '                                <div class="col-sm-4">' +
        '                                    <input type="time" class="form-control" v-model="openedItem.exception.endTime" />' +
        '                                </div>' +
        '                            </div>' +
        '                        </form>' +
        '                    </div>' +
        '                </div>' +
        '                <div class="modal-footer">' +
        '                    <button v-if="openedItem !== null && openedItem.Name !== null" @click="deleteItem" type="button" class="btn btn-danger mr-auto">Supprimer</button>' +
        '                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Fermer</button>' +
        '                    <button type="button" id="saveItemButton" class="btn btn-primary" @click="saveItem">Sauvegarder</button>' +
        '                </div>' +
        '            </div>' +
        '        </div>' +
        '    </div>'
})