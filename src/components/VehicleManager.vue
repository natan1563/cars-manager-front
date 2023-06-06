<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-container>
    <v-data-table
      :headers="headers"
      :items="listOfVehicles"
      :items-per-page="5"
      class="elevation-1 mt-5"
       :footer-props="{
      'items-per-page-text':'Usuários por página',
      pageText: '{0}-{1} de {2}'
    }"
    >
      <template #item.created_at="{ item }">
        <span>{{ item.created_at | formatDate }}</span>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon
          small
          class="mr-2"
          @click="editItem(item)"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          small
          @click="openModalDelete(item)"
        >
          mdi-delete
        </v-icon>
    </template>
    </v-data-table>

    <v-btn
      color="primary"
      variant="text"
      class="mt-5"
      @click="openModalCreate"
    >
      Novo Veículo
    </v-btn>

    <v-dialog
      v-model="deleteDialog"
      activator="parent"
      width="auto"
    >
      <v-card v-if="currentCar">
        <v-card-title  class="text-h5">
         Tem certeza que deseja excluir o veículo de placa: {{ currentCar?.placa }}?
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="text"
            @click="deleteRegister(currentCar?.id)"
          >
            Continuar
          </v-btn>
          <v-btn
            color="secondary"
            variant="text"
            @click="deleteDialog = false"
          >
            Cancelar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <VehicleModal
      :vehicle-data="currentCar"
    />
  </v-container>
</template>

<script>
  import VehicleModal from './VehicleModal'

  export default {
    components: {
      VehicleModal,
    },
    data () {
      return {
        headers: [
          {
            text: '# ID',
            align: 'start',
            value: 'id',
          },
          { text: 'Placa', value: 'placa', sorteble: false },
          { text: 'Chassi', value: 'chassi', sortable: false },
          { text: 'Renavam', value: 'renavam', sortable: false },
          { text: 'Modelo', value: 'modelo' },
          { text: 'Marca', value: 'marca' },
          { text: 'Ano', value: 'ano' },
          { text: 'Data de Registro', value: 'created_at' },
          { text: 'Ações', value: 'actions', sortable: false },
        ],
        listOfVehicles: [],
        currentCar: {},
        deleteDialog: false,
      }
    },

    filters: {
      formatDate(value) {
        return new Date(value).toLocaleDateString('brazil');
      }
    },

    async created () {
      await this.buildVehicles();
    },

    mounted () {
      this.$eventBus.$on('build-vehicles-event', () => {
        this.buildVehicles()
      });
    },

    destroyed() {
      this.$eventBus.$off('build-vehicles-event')
    },

    methods: {
      async buildVehicles() {
        await this.$api
          .get('/vehicle')
          .then(response => {
            this.listOfVehicles = response.data
          })
      },

      openModalDelete(carData) {
        this.currentCar = carData
        this.deleteDialog = true
      },

      openModalCreate() {
        this.currentCar = {}
        this.openModal()
      },

      openModal(editMode = false) {
        this.$eventBus.$emit('open-modal-vehicle', editMode)
      },

      deleteRegister(vehicleID) {
        this.$api.delete(`/vehicle/${vehicleID}`)
        .then(() => {
          this.deleteDialog = false
          this.buildVehicles()
        })
      },

      editItem(carData) {
        this.currentCar = carData
        this.openModal(true);
      }
    },
  }
</script>