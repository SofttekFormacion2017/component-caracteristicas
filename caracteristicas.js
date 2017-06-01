angular.module('ghr.caracteristicas', []) // Creamos este modulo para la entidad caracteristicas
  .component('ghrCaracteristicas', { // Componente que contiene la url que indica su html
    templateUrl: '../bower_components/component-caracteristicas/caracteristicas.html',
    // El controlador de ghrCaracteristicas
    controller($stateParams, caracteristicasFactory, $state) {
      const vm = this;

      vm.mode = $stateParams.mode;

      caracteristicasFactory.getAll().then(function onSuccess(response) {
        vm.arrayCaracteristicas = response.filter(function (caracteristica) {
          return caracteristica.idCandidato == $stateParams.id;
        });
      });

      vm.update = function (user) {
        if ($stateParams.id == 0) {
          delete $stateParams.id;
          caracteristicasFactory.create(vm.caracteristica).then(function (caracteristica) {
            $state.go($state.current, {
              id: caracteristica.id
            });
          });
        }
        if (vm.form.$dirty === true) {
          caracteristicasFactory.update(vm.caracteristica).then(function (caracteristica) {});
        }
      };

      vm.reset = function (form) {
        vm.caracteristica = angular.copy(vm.original);
      };
      if ($stateParams.id != 0) {
        vm.original = caracteristicasFactory.read($stateParams.id).then(
          function (caracteristica) {
            vm.caracteristica = caracteristica;
          }
        );
      }

      vm.desplegar = function () {
        vm.opcionesDesplegable = [{
          tipo: 'Teléfono',
          icon: 'phone'
        },
        {
          tipo: 'Correo',
          icon: 'envelope'
        },
        {
          tipo: 'Facebook',
          icon: 'facebook'
        },
        {
          tipo: 'LinkedIn',
          icon: 'linkedin'
        },
        {
          tipo: 'Twitter',
          icon: 'twitter'
        }
        ];
        vm.selectTipo = vm.opcionesDesplegable[0];
      };
      vm.desplegar();

      vm.mostrarIconoCaracteristicas = function (tipo) {
        if (tipo == 'Teléfono') {
          return 'phone';
        } else if (tipo == 'Correo') {
          return 'envelope';
        } else if (tipo == 'Facebook') {
          return 'facebook';
        } else if (tipo == 'LinkedIn') {
          return 'linkedin';
        } else if (tipo == 'Twitter') {
          return 'twitter';
        }
      };
    }
  })
  .constant('caractBaseUrl', 'http://localhost:3003/api/')
  .constant('caractEntidad', 'caracteristicas')
  .factory('caracteristicasFactory', function crearCaracteristicas($http, caractBaseUrl, caractEntidad) {
    var serviceUrl = caractBaseUrl + caractEntidad;
    return {
      // sistema CRUD de caracteristica
      getAll: function getAll() {
        return $http({
          method: 'GET',
          url: serviceUrl
        }).then(function onSuccess(response) {
          return response.data;
        },
          function onFailirure(reason) {

          });
      },
      create: function create(caracteristica) {
        return $http({
          method: 'POST',
          url: serviceUrl,
          data: caracteristica
        }).then(function onSuccess(response) {
          return response.data;
        },
          function onFailirure(reason) {

          });
      },
      read: function read(id) {
        return $http({
          method: 'GET',
          url: serviceUrl + '/' + id
        }).then(function onSuccess(response) {
          return response.data;
        });
        return angular.copy(_getReferenceById(id));
      },
      update: function update(caracteristica) {
        return $http({
          method: 'PATCH',
          url: serviceUrl + '/' + caracteristica.id,
          data: caracteristica
        }).then(function onSuccess(response) {
          return response.data;
        });
      },
      delete: function _delete(selectedItem) {
        return $http({
          method: 'DELETE',
          url: serviceUrl + '/' + selectedItem
        });
      }
    };
  })
  .config(function (toastrConfig) { // Configura los toastr
    angular.extend(toastrConfig, {
      closeButton: true,
      extendedTimeOut: 2000,
      tapToDismiss: true
    });
  })
  .component('ghrCaracteristicasList', {
    templateUrl: '../bower_components/component-caracteristicas/caracteristicas-list.html',
    controller(caracteristicasFactory, $uibModal, $log, $document) {
      const vm = this;

      caracteristicasFactory.getAll().then(function onSuccess(response) {
        vm.arrayCaracteristicas = response;
        vm.caracteristica = vm.arrayCaracteristicas;
      });

      vm.currentPage = 1;
      vm.setPage = function (pageNo) {
        vm.currentPage = pageNo;
      };

      vm.maxSize = 10; // Elementos mostrados por página
      vm.open = function (id, tipo, valor) {
        var modalInstance = $uibModal.open({
          component: 'eliminarCaracteristicasModal',
          resolve: {
            seleccionado: function () {
              return id;
            }
          }
        });

        modalInstance.result.then(function (selectedItem) {
          console.log('selectedItem -->' + selectedItem);
          vm.arrayCaracteristicas = caracteristicasFactory.getAll();
          caracteristicasFactory.delete(selectedItem).then(function () {
            toastr.success('elimanda correctamente');
            caracteristicasFactory.getAll().then(function (caracteristicas) {
              vm.arrayCaracteristicas = caracteristicas;
            });
          });
        });
      };
    }
  })
  .component('eliminarCaracteristicasModal', {
    // El componente del modal
    templateUrl: '../bower_components/component-caracteristicas/eliminadoCaracteristicasModal.html',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
    controller: function () {
      const vm = this;
      vm.$onInit = function () {
        vm.selected = vm.resolve.seleccionado;
      };
      vm.ok = function (seleccionado) { // Este metodo nos sirve para marcar el candidato que se ha seleccionado
        vm.close({
          $value: seleccionado
        });
      };
      vm.cancel = function () { // Este metodo cancela la operacion
        vm.dismiss({
          $value: 'cancel'
        });
      };
    }
  })
  .run($log => {
    $log.log('Ejecutando Componente Caracteristicas');
  });
