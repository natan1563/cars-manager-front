<template>
  <v-app>
    <v-app-bar
      app
      color="dark"
      dark
    >
      <h3>CarsManager</h3>
    </v-app-bar>

    <v-main class="mt-5">
      <router-view/>
    </v-main>

    <ErrorSnackbar />
  </v-app>
</template>

<script>
import ErrorSnackbar from './components/alerts/ErrorSnackbar'

export default {
  name: 'App',

  components: {
    ErrorSnackbar,
  },

  data: () => ({
    //
  }),
};
</script>
