<template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      persistent
      width="1024"
    >
      <validation-observer
        ref="observer"
      >
        <v-form @submit.prevent="submitForm">
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ isEditOption ? 'Editar' : 'Cadastrar'}} Veículo</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                  >
                     <validation-provider
                        v-slot="{ errors }"
                        name="Placa"
                        rules="required|max:8"
                      >
                      <v-text-field
                        v-model="carObject.placa"
                        :counter="8"
                        :error-messages="errors"
                        label="Placa"
                        required
                      ></v-text-field>
                     </validation-provider>
                  </v-col>

                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <validation-provider
                      v-slot="{ errors }"
                      name="Chassi"
                      rules="required|max:17"
                    >
                      <v-text-field
                        v-model="carObject.chassi"
                        :error-messages="errors"
                        :counter="17"
                        label="Chassi"
                        hint="example of helper text only on focus"
                      ></v-text-field>
                    </validation-provider>
                  </v-col>

                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <validation-provider
                      v-slot="{ errors }"
                      name="Renavam"
                      rules="required|max:11"
                    >
                      <v-text-field
                        v-model="carObject.renavam"
                        :error-messages="errors"
                        :counter="11"
                        label="Renavam"
                        required
                      ></v-text-field>
                     </validation-provider>
                  </v-col>

                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <validation-provider
                      v-slot="{ errors }"
                      name="Marca"
                      rules="required|max:40"
                    >
                      <v-text-field
                        v-model="carObject.marca"
                        :error-messages="errors"
                        :counter="40"
                        label="Marca"
                        required
                      ></v-text-field>
                    </validation-provider>
                  </v-col>

                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <validation-provider
                      v-slot="{ errors }"
                      name="Modelo"
                      rules="required|max:40"
                    >
                      <v-text-field
                        v-model="carObject.modelo"
                        :error-messages="errors"
                        :counter="40"
                        label="Modelo"
                        required
                      ></v-text-field>
                    </validation-provider>
                  </v-col>

                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <validation-provider
                      v-slot="{ errors }"
                      name="Ano"
                      rules="required|max:4"
                    >
                      <v-text-field
                        v-model="carObject.ano"
                        label="Ano"
                        type="number"
                        :error-messages="errors"
                        :counter="4"
                        required
                      ></v-text-field>
                    </validation-provider>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="error"
                variant="text"
                @click="resetFormulary"
              >
                Fechar
              </v-btn>
              <v-btn
                color="success"
                variant="text"
                type="submit"
              >
                Salvar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </validation-observer>
    </v-dialog>
  </v-row>
</template>

<script>
  import { required, max } from 'vee-validate/dist/rules'
  import { extend, ValidationObserver, ValidationProvider, setInteractionMode } from 'vee-validate'
  setInteractionMode('eager')

  extend('required', {
    ...required,
    message: '{_field_} não pode estar vazio.',
  })

  extend('max', {
    ...max,
    message: '{_field_} não pode ter mais de {length} caracteres.',
  })

  export default {
    components: {
      ValidationObserver,
      ValidationProvider
    },
    props: {
      vehicleData: {
        type: Object,
        required: false,
        default: () => {
          return {}
        }
      },
    },
    data: () => ({
      dialog: false,
      isEditOption: false,
      carObject: {
        placa: null,
        chassi: null,
        renavam: null,
        modelo: null,
        marca: null,
        ano: null
      }
    }),

    mounted () {
      this.$eventBus.$on('open-modal-vehicle', (isEditOption) => {
        this.dialog = true;
        this.isEditOption = isEditOption
      })
    },

    watch: {
      vehicleData(newValue) {
        this.carObject = Object.assign({}, newValue)
      }
    },

    methods: {
      submitForm() {
        this.$refs.observer
        .validate()
        .then((isValid) => {
          if (!isValid) {
            throw new Error('Por favor verifique os campos pendentes e tente novamente.')
          }

          if (this.isEditOption) {
            this.editCurrentCar()
            return;
          }
          
          this.createANewCar()
        })
        .catch((err) => {
          this.$eventBus.$emit('active-snackbar', err.message)
        })
      },

      createANewCar() {
        this.$api
          .post('/vehicle', this.carObject)
          .then(response => {
            if (response.status !== 201) {
              throw new Error('Fail to create a vehicle')
            }

            this.$eventBus.$emit('build-vehicles-event')
            this.resetFormulary()
          })
          .catch(error => {
            this.$eventBus.$emit('active-snackbar', error.message)
          })
          .finally(() => {
            this.dialog = false;
          })
      },

      editCurrentCar() {
        const params = Object.assign({}, this.carObject)
        delete params.id
        delete params.created_at
        delete params.updated_at

        this.$api
          .put(`/vehicle/${this.carObject?.id}`, params)
          .then(response => {
            if (response.status !== 200) {
              throw new Error('Fail to edit the vehicle')
            }

            this.$eventBus.$emit('build-vehicles-event')
            this.resetFormulary()
          })
          .catch(error => {
            this.$eventBus.$emit('active-snackbar', error.message)
          })
          .finally(() => {
            this.dialog = false;
          })  
      },

      resetFormulary() {
        this.dialog = false;
        this.isEditOption = false;
        this.currentCar = {
          placa: null,
          chassi: null,
          renavam: null,
          modelo: null,
          marca: null,
          ano: null
        }
      }
    },
  }
</script>