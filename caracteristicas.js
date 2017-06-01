angular.module('ghr.caracteristicas', []) // Creamos este modulo para la entidad caracteristicas
    .component('ghrCaracteristicas', { // Componente que contiene la url que indica su html
        templateUrl: '../bower_components/component-caracteristicas/caracteristicas.html',
        // El controlador de ghrcaracteristicas
        controller($stateParams, caracteristicasFactory, $state) {
            const vm = this;

            vm.mode = $stateParams.mode;

            caracteristicasFactory.getAll().then(function onSuccess(response) {
                vm.arraycaracteristicas = response.filter(function(caracteristica) {
                    return caracteristica.idCandidato == $stateParams.id;
                });
            });

            vm.update = function(user) {
                if ($stateParams.id == 0) {
                    delete $stateParams.id;
                    caracteristicasFactory.create(vm.caracteristica).then(function(caracteristica) {
                        $state.go($state.current, {
                            id: caracteristica.id
                        });
                    });
                }
                if (vm.form.$dirty === true) {
                    caracteristicasFactory.update(vm.caracteristica).then(function(caracteristica) {});
                }
            };

            vm.reset = function(form) {
                vm.caracteristica = angular.copy(vm.original);
            };
            if ($stateParams.id != 0) {
                vm.original = caracteristicasFactory.read($stateParams.id).then(
                    function(caracteristica) {
                        vm.caracteristica = caracteristica;
                    }
                );
            }


        }
    })
    .constant('baseUrl', 'http://localhost:3003/api/')
    .constant('caractEntidad', 'caracteristicas')
    .factory('caracteristicasFactory', function crearcaracteristicas($http, baseUrl, caractEntidad) {
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
    .component('ghrcaracteristicasList', {
        templateUrl: '../bower_components/component-caracteristicas/caracteristicas-list.html',
        controller(caracteristicasFactory, $uibModal, $log, $document) {
            const vm = this;

            caracteristicasFactory.getAll().then(function onSuccess(response) {
                vm.arraycaracteristicas = response;
                vm.caracteristica = vm.arraycaracteristicas;
            });

            vm.currentPage = 1;
            vm.setPage = function(pageNo) {
                vm.currentPage = pageNo;
            };

            vm.maxSize = 10; // Elementos mostrados por página
            vm.open = function(id, nombre) {
                var modalInstance = $uibModal.open({
                    component: 'eliminarCaracteristicaModal',
                    resolve: {
                        seleccionado: function() {
                            return id;
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {
                    vm.arraycaracteristicas = caracteristicasFactory.getAll();
                    caracteristicasFactory.delete(selectedItem).then(function() {
                        caracteristicasFactory.getAll().then(function(caracteristica) {
                            vm.arraycaracteristicas = caracteristica;
                        });
                    });
                });
            };
        }
    })
    .run($log => {
        $log.log('Ejecutando Componente caracteristicas');
    });