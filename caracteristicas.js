angular.module('ghr.caracteristicas', ['toastr']) // Creamos este modulo para la entidad caracteristicas
  .component('ghrCaracteristicas', { // Componente que contiene la url que indica su html
    templateUrl: '../bower_components/component-caracteristicas/caracteristicas.html',
    // El controlador de ghrcaracteristicas
    controller(toastr, $stateParams, caracteristicasFactory, $state) {
      const vm = this;

      vm.mode = $stateParams.mode;

      /**
       * Cambia al modo entre view y edit
       * @return {[type]} [description]
       */
      vm.changeMode = function () {
        var modo;
        if ($stateParams.mode == 'view') {
          modo = 'edit';
        } else {
          modo = 'view';
        }
        $state.go($state.current, {
          mode: modo
        });
        vm.mode = $stateParams.mode;
      };

      vm.setOriginal = function (data) {
        vm.original = angular.copy(data);
      };

      caracteristicasFactory.getAll().then(function onSuccess(response) {
        vm.arrayCaracteristicas = response.filter(function (caracteristica) {
          return caracteristica.idCaracteristicas == $stateParams.id;
        });
      });

      vm.updateOrCreate = function (caracteristica, formulario) {
        if (formulario.$valid) {
          // Update
          if ($stateParams.id != 0) {
            var caracteristicaModificado = {};
            for (var i = 0; i < formulario.$$controls.length; i++) {
              var input = formulario.$$controls[i];
              if (input.$dirty) {
                caracteristicaModificado[input.$name] = input.$modelValue;
              }
            }
            if (formulario.$dirty) {
              caracteristicasFactory.update(caracteristicaModificado, vm.caracteristica.id).then(
                function onSuccess(response) {
                  vm.setOriginal(response);
                  toastr.success('El caracteristica se ha actualizado correctamente.');
                },
                function onFailure() {
                  toastr.error('No se ha podido realizar la operacion, por favor compruebe su conexion a internet e intentelo más tarde.');
                }
              );
            } else {
              toastr.info('No hay nada que modificar', 'Info');
            }
          }
          // Create
          else {
            caracteristicasFactory.create(vm.caracteristica).then(
              function onSuccess(response) {
                delete vm.caracteristica.id;
                $state.go($state.current, {
                  id: response.id,
                  mode: 'view'
                });
                toastr.success('Caracteristica creado correctamente');
              },
              function onFailure() {
                toastr.error('No se ha podido realizar la operacion, por favor compruebe su conexion a internet e intentelo más tarde.');
              }
            );
          }
        }
      };

      if ($stateParams.id != 0) {
        caracteristicasFactory.read($stateParams.id).then(
          function onSuccess(response) {
            vm.setOriginal(response);
          },
          function onFailure() {
            toastr.error('No se ha podido realizar la operacion, por favor compruebe su conexion a internet e intentelo más tarde.');
          }
        );
      }

      vm.reset = function () {
        vm.caracteristica = angular.copy(vm.original);
      };
      vm.reset();

      if ($stateParams.id != 0) {
        vm.original = caracteristicasFactory.read($stateParams.id).then(
          function (caracteristica) {
            vm.caracteristica = caracteristica;
          }
        );
      }
    }
  })
  .config(function (toastrConfig) { // Configura los toastr
    angular.extend(toastrConfig, {
      closeButton: true,
      extendedTimeOut: 2000,
      tapToDismiss: true
    });
  })
  .constant('baseUrl', 'http://localhost:3003/api/')
  .constant('caractEntidad', 'caracteristicas')
  .factory('caracteristicasFactory', function crearcaracteristicas($http, baseUrl, caractEntidad, toastr) {
    /**
     * Devuelve la referencia de un candidato
     * @param       {[type]} id [description]
     * @constructor
     * @return      {[type]}    [description]
     */
    function _getReferenceById(id) {
      var candidato;
      for (var i = 0; i < arrayCaracteristicas.length || candidato === undefined; i++) {
        if (arrayCaracteristicas[i].id == id) {
          candidato = arrayCaracteristicas[i];
        }
      }
      return candidato;
    }

    /**
     * Devuelve el índice en el arrayCaracteristicas de un candidato
     * @param       {[type]} id [description]
     * @constructor
     * @return      {[type]}    [description]
     */
    function _getIndexById(id) {
      return arrayCaracteristicas.indexOf(_getReferenceById(id));
    }

    var serviceUrl = baseUrl + caractEntidad;
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
      update: function _update(caracteristicaModificado, id) {
        return $http({
          method: 'PATCH',
          url: serviceUrl + '/' + id,
          data: caracteristicaModificado
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
      vm.open = function (id, nombre) {
        var modalInstance = $uibModal.open({
          component: 'eliminarCaracteristicaModal',
          resolve: {
            seleccionado: function () {
              return id;
            }
          }
        });

        modalInstance.result.then(function (selectedItem) {
          vm.arrayCaracteristicas = caracteristicasFactory.getAll();
          caracteristicasFactory.delete(selectedItem).then(function () {
            caracteristicasFactory.getAll().then(function (caracteristica) {
              vm.arrayCaracteristicas = caracteristica;
            });
          });
        });
      };
    },
  })
  .component('eliminarCaracteristicaModal', { // El componente del modal
      templateUrl: '../bower_components/component-caracteristicas/eliminarCaracteristicaModal.html',
      bindings: {
          resolve: '<',
          close: '&',
          dismiss: '&'
      },
      controller: function() {
          const vm = this;
          vm.$onInit = function() {
              vm.selected = vm.resolve.seleccionado;
          };
          vm.ok = function(seleccionado) { //Este metodo nos sirve para marcar el candidato que se ha seleccionado
              vm.close({
                  $value: seleccionado
              });
          };
          vm.cancel = function() { //Este metodo cancela la operacion
              vm.dismiss({
                  $value: 'cancel'
              });
          };
      }
  })
  .run($log => {
    $log.log('Ejecutando Componente caracteristicas');
  });
