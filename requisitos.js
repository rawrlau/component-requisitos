angular.module('ghr.requisitos', ['ghr.caracteristicas', 'ghr.candidatos']) // Creamos este modulo para la entidad requisitos
  .component('ghrRequisitos', { // Componente que contiene la url que indica su html
    templateUrl: '../bower_components/component-requisitos/requisitos.html',
    // El controlador de ghrrequisitos
    controller($stateParams, requisitosFactory, $state, caracteristicasFactory, candidatoFactory) {
      const vm = this;
      vm.mode = $stateParams.mode;

      requisitosFactory.getAll().then(function onSuccess(response) {
        vm.arrayRequisitos = response.filter(function (requisito) {
          return requisito.idCandidato == $stateParams.id;
        });
      });
      vm.update = function (user) {
        if ($stateParams.id == 0) {
          delete $stateParams.id;
          requisitosFactory.create(vm.requisitos).then(function (requisito) {
            $state.go($state.current, {
              id: requisito.id
            });
          });
        }
        if (vm.form.$dirty === true) {
          requisitosFactory.update(vm.requisitos).then(function (requisito) {});
        }
      };
      vm.reset = function (form) {
        vm.requisitos = angular.copy(vm.original);
      };
      vm.prueba;
      if ($stateParams.id != 0) {
        candidatoFactory.read($stateParams.id).then(function (candidato) {
          vm.original = requisitosFactory.read(candidato.listaDeRequisitoId).then(function (requisitos) {
            vm.requisitos = requisitos;
            caracteristicasFactory.getAll().then(function (caracteristicas) {
              vm.caracteristicas = caracteristicas;
              vm.arrayCaracteristicas = [];
              for (var i = 0; i < vm.requisitos.length; i++) {
                for (var j = 0; j < vm.caracteristicas.length; j++) {
                  if (vm.requisitos[i].caracteristicaId == vm.caracteristicas[j].id) {
                    vm.arrayCaracteristicas.push(vm.caracteristicas[j]);
                  }
                }
              }
            });

              // console.log(' LENGTH DE ARRAY REQUISITOS: ' + vm.requisitos.length);
            // vm.comprobar(vm.requisitos);
          }
          );
        });

        vm.comprobar = function (requisito) {
          for (var i = 0; i < requisito.length; i++) {
            console.log('DENTRO DE FUNCION COMPROBAR');
            idCar = requisito[i].caracteristicaId;
            // if (idCar != 0) {
              // console.log('ENTRO AL IF CON ID: ' + idCar);
            vm.leer(idCar);
            // }
          }
        };

        vm.leer = function (idCar) {
          console.log('DENTRO DE FUNCION LEER CON ID: ' + idCar);
          caracteristicasFactory.read(idCar).then(
            function (caracteristica) {
              console.log('DENTRO DE FACTORY CON ID: ' + idCar);
              vm.prueba = caracteristica;
              console.log(caracteristica.nombre);
            }
          );
        };
      }
    }
  })
  .constant('baseUrl', 'http://localhost:3003/api/')
  .constant('reqEntidad', 'listaDeRequisitos')
  .factory('requisitosFactory', function crearrequisitos($http, baseUrl, reqEntidad, caracteristicasFactory, candidatoFactory) {
    var serviceUrl = baseUrl + reqEntidad;
    return {
      // sistema CRUD de requisito
      //
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
      create: function create(requisito) {
        return $http({
          method: 'POST',
          url: serviceUrl,
          data: requisito
        }).then(function onSuccess(response) {
          return response.data;
        },
          function onFailirure(reason) {
          });
      },
      read: function read(id) {
        return $http({
          method: 'GET',
          url: serviceUrl + '/' + id + '/requisitos'
        }).then(function onSuccess(response) {
          return response.data;
        });
        return angular.copy(_getReferenceById(id));
      },
      update: function update(requisito) {
        return $http({
          method: 'PATCH',
          url: serviceUrl + '/' + requisito.id,
          data: requisito
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
  .component('ghrRequisitosList', {
    templateUrl: '../bower_components/component-requisitos/requisitos-list.html',
    controller(requisitosFactory, $uibModal, $log, $document) {
      const vm = this;
      requisitosFactory.getAll().then(function onSuccess(response) {
        vm.arrayRequisitos = response;
        vm.requisitos = vm.arrayRequisitos;
      });
      vm.currentPage = 1;
      vm.setPage = function (pageNo) {
        vm.currentPage = pageNo;
      };
      vm.maxSize = 10; // Elementos mostrados por página
      vm.open = function (id, nombre) {
        var modalInstance = $uibModal.open({
          component: 'eliminarRequisitoModal',
          resolve: {
            seleccionado: function () {
              return id;
            }
          }
        });
        modalInstance.result.then(function (selectedItem) {
          vm.arrayRequisitos = requisitosFactory.getAll();
          requisitosFactory.delete(selectedItem).then(function () {
            requisitosFactory.getAll().then(function (requisito) {
              vm.arrayRequisitos = requisito;
            });
          });
        });
      };
    }
  })
  .run($log => {
    $log.log('Ejecutando Componente Requisitos');
  });
