console.log('🔧 Cargando aplicación...');

// Variables globales
let totalCreditosSeleccionados = 0;
const LIMITE_CREDITOS = 20;
let prologCargado = false;

// BASE DE CONOCIMIENTO CORREGIDA 
const BASE_CONOCIMIENTO = `
% CURSOS DE LA CARRERA
curso(matematicas1, 4, 1).
curso(matematicas2, 4, 2).
curso(programacion1, 5, 1).
curso(programacion2, 5, 2).
curso(logica, 3, 1).
curso(inteligencia_artificial, 4, 5).
curso(bases_de_datos, 4, 3).
curso(algoritmos, 5, 3).
curso(redes, 4, 4).
curso(sistemas_operativos, 4, 4).
curso(ingenieria_software, 4, 5).
curso(arquitectura_computadoras, 4, 3).
curso(calculo1, 4, 1).
curso(calculo2, 4, 2).
curso(fisica1, 4, 2).
curso(fisica2, 4, 3).
curso(ingles_tecnico, 2, 2).
curso(etica_profesional, 2, 5).

% PRERREQUISITOS SIMPLIFICADOS
prerequisito(matematicas2, matematicas1).
prerequisito(programacion2, programacion1).
prerequisito(inteligencia_artificial, logica).
prerequisito(inteligencia_artificial, programacion2).
prerequisito(bases_de_datos, programacion1).
prerequisito(algoritmos, matematicas2).
prerequisito(redes, sistemas_operativos).
prerequisito(sistemas_operativos, programacion1).
prerequisito(ingenieria_software, programacion2).
prerequisito(arquitectura_computadoras, programacion1).
prerequisito(calculo2, calculo1).
prerequisito(fisica2, fisica1).
prerequisito(fisica1, matematicas1).

% =============================================
% ESTUDIANTES CON DIFERENTES SITUACIONES
% =============================================

% CASO 1: ANA - ESTUDIANTE AVANZADO
aprobado(ana, matematicas1).
aprobado(ana, matematicas2).
aprobado(ana, programacion1).
aprobado(ana, programacion2).
aprobado(ana, logica).
aprobado(ana, bases_de_datos).
aprobado(ana, algoritmos).
aprobado(ana, sistemas_operativos).
aprobado(ana, calculo1).
aprobado(ana, calculo2).
aprobado(ana, fisica1).

% CASO 2: JUAN - ESTUDIANTE REGULAR
aprobado(juan, matematicas1).
aprobado(juan, programacion1).
aprobado(juan, logica).
aprobado(juan, calculo1).
aprobado(juan, fisica1).
aprobado(juan, ingles_tecnico).

% CASO 3: LUIS - CON PROBLEMAS EN MATEMÁTICAS
aprobado(luis, programacion1).
aprobado(luis, logica).
aprobado(luis, ingles_tecnico).

% CASO 4: MARIA - ESTUDIANTE NUEVO
aprobado(maria, matematicas1).
aprobado(maria, programacion1).

% CASO 5: PEDRO - ESTUDIANTE IRREGULAR
aprobado(pedro, programacion2).
aprobado(pedro, bases_de_datos).
aprobado(pedro, inteligencia_artificial).
aprobado(pedro, redes).

% CASO 6: CARLOS - ESTUDIANTE DE INTERCAMBIO
aprobado(carlos, matematicas1).
aprobado(carlos, matematicas2).
aprobado(carlos, programacion1).
aprobado(carlos, calculo1).
aprobado(carlos, calculo2).
aprobado(carlos, fisica1).
aprobado(carlos, fisica2).

% CASO 7: SOFIA - ESTUDIANTE EXCELENTE
aprobado(sofia, matematicas1).
aprobado(sofia, matematicas2).
aprobado(sofia, programacion1).
aprobado(sofia, programacion2).
aprobado(sofia, logica).
aprobado(sofia, bases_de_datos).
aprobado(sofia, algoritmos).
aprobado(sofia, sistemas_operativos).
aprobado(sofia, calculo1).
aprobado(sofia, calculo2).
aprobado(sofia, fisica1).
aprobado(sofia, ingles_tecnico).
aprobado(sofia, arquitectura_computadoras).

% CASO 8: MIGUEL - CON PROBLEMAS ACADÉMICOS
aprobado(miguel, matematicas1).
aprobado(miguel, programacion1).
aprobado(miguel, logica).

% REGLAS PRINCIPALES - VERSIÓN SIMPLE Y FUNCIONAL
no_repetido(Alumno, Curso) :-
    not(aprobado(Alumno, Curso)).

puede_cursar(Alumno, Curso) :-
    curso(Curso, _, _),
    forall(prerequisito(Curso, Pre), aprobado(Alumno, Pre)).

curso_disponible(Alumno, Curso) :-
    puede_cursar(Alumno, Curso),
    no_repetido(Alumno, Curso).

prerrequisito_faltante(Alumno, Curso, Faltante) :-
    prerequisito(Curso, Faltante),
    not(aprobado(Alumno, Faltante)).
`;


// Esperar a que Tau-Prolog esté disponible
function esperarTauProlog() {
    return new Promise((resolve, reject) => {
        let intentos = 0;
        const maxIntentos = 50;
        
        const verificar = () => {
            intentos++;
            
            if (typeof pl !== 'undefined' && pl.create) {
                console.log('✅ Tau-Prolog cargado correctamente');
                prologCargado = true;
                resolve(true);
            } else if (intentos >= maxIntentos) {
                reject(new Error('Tau-Prolog no se cargó en el tiempo esperado'));
            } else {
                setTimeout(verificar, 100);
            }
        };
        
        verificar();
    });
}

//Cargar la base de conocimiento
function cargarBaseConocimiento(session) {
    return new Promise((resolve, reject) => {
        try {
            console.log('📚 Intentando cargar base de conocimiento...');
            
            // Método directo
            session.consult(BASE_CONOCIMIENTO, {
                success: function() {
                    console.log('✅ Base de conocimiento cargada exitosamente');
                    resolve(true);
                },
                error: function(err) {
                    console.error('❌ Error cargando base de conocimiento:', err);
                    reject(new Error('Error en consult: ' + err));
                }
            });
            
        } catch (error) {
            console.error('💥 Excepción en carga de base:', error);
            reject(error);
        }
    });
}

function probarProlog() {
    try {
        console.log('🧪 Probando Tau-Prolog con consulta simple...');
        const session = pl.create(10000);
        
        // Probar con una consulta MUY simple primero
        const testSimple = session.consult('test.');
        if (testSimple === true) {
            console.log('✅ Consulta simple funciona');
        }
        
        // Probar con nuestra base
        return cargarBaseConocimiento(session);
        
    } catch (error) {
        console.error('❌ Error en prueba Prolog:', error);
        return Promise.reject(error);
    }
}

// Inicializar el sistema
async function inicializarSistema() {
    console.log('🚀 Inicializando sistema...');
    
    try {
        await esperarTauProlog();
        
        // Probar que Prolog funciona con nuestra base
        await probarProlog();
        
        console.log('🎉 Sistema inicializado correctamente');
        document.getElementById('disponibles').innerHTML = 
            '<div class="success">✅ Sistema listo. Selecciona "Ana García" y haz clic en "Ver Cursos Disponibles"</div>';
            
    } catch (error) {
        console.error('💥 Error inicializando sistema:', error);
        document.getElementById('disponibles').innerHTML = 
            '<div class="error">❌ Error: ' + error.message + '</div>';
    }
}

// Consultar cursos disponibles
async function consultarCursos() {
    if (!prologCargado) {
        alert('⚠️ El sistema Prolog aún no está cargado. Por favor espera...');
        return;
    }

    const alumno = document.getElementById("alumno").value;
    const disponibles = document.getElementById("disponibles");
    const bloqueados = document.getElementById("bloqueados");
    const repetidos = document.getElementById("repetidos");
    
    if (!alumno) {
        alert('❌ Por favor selecciona un alumno');
        return;
    }
    
    console.log('🔍 Consultando cursos para:', alumno);
    
    // Mostrar loading
    disponibles.innerHTML = '<div class="loading">🔄 Consultando cursos...</div>';
    bloqueados.innerHTML = '';
    repetidos.innerHTML = '';
    totalCreditosSeleccionados = 0;
    actualizarContadorCreditos();

    try {
        const session = pl.create(10000);
        
        // Cargar base de conocimiento
        await cargarBaseConocimiento(session);
        
        console.log('🔎 Buscando cursos disponibles...');
        
        let cursosEncontrados = 0;
        
        
        session.query("curso_disponible(" + alumno + ", Curso), curso(Curso, Creditos, Semestre).");
        
        session.answers(function(answer) {
            if (pl.type.is_substitution(answer)) {
                const curso = answer.lookup("Curso");
                const creditos = answer.lookup("Creditos");
                const semestre = answer.lookup("Semestre");
                
                console.log('✅ CURSO DISPONIBLE:', curso.id, '- Créditos:', creditos.value);
                
                disponibles.innerHTML += crearCheckboxCurso(
                    curso.id, 
                    creditos.value, 
                    semestre.value
                );
                
                cursosEncontrados++;
            }
        }, 1000, function() {
            console.log('📊 Total cursos disponibles encontrados:', cursosEncontrados);
            
            if (cursosEncontrados === 0) {
                disponibles.innerHTML = '<div class="sin-resultados">No hay cursos disponibles para ' + alumno + '</div>';
                console.log('⚠️ No se encontraron cursos disponibles');
            }
        });

        // CONSULTA PARA CURSOS BLOQUEADOS
        setTimeout(() => {
            const sessionBloq = pl.create(5000);
            cargarBaseConocimiento(sessionBloq).then(() => {
                sessionBloq.query("curso(Curso, _, _), not(curso_disponible(" + alumno + ", Curso)), not(aprobado(" + alumno + ", Curso)).");
                
                sessionBloq.answers(function(answer) {
                    if (pl.type.is_substitution(answer)) {
                        const curso = answer.lookup("Curso");
                        console.log('🚫 CURSO BLOQUEADO:', curso.id);
                        
                        // Buscar qué prerrequisitos faltan
                        const sessionFaltantes = pl.create(3000);
                        cargarBaseConocimiento(sessionFaltantes).then(() => {
                            let faltantes = [];
                            sessionFaltantes.query("prerrequisito(" + curso + ", Pre), not(aprobado(" + alumno + ", Pre)).");
                            
                            sessionFaltantes.answers(function(ans) {
                                if (pl.type.is_substitution(ans)) {
                                    faltantes.push(ans.lookup("Pre").id);
                                }
                            }, 500, function() {
                                const motivo = faltantes.length > 0 
                                    ? '❌ Falta: ' + faltantes.join(', ')
                                    : '❌ No disponible';
                                    
                                bloqueados.innerHTML += crearElementoBloqueado(curso.id, 'bloqueado', motivo);
                            });
                        });
                    }
                }, 1500);
            });
        }, 1000);

        // CONSULTA PARA CURSOS APROBADOS
        setTimeout(() => {
            const sessionRep = pl.create(5000);
            cargarBaseConocimiento(sessionRep).then(() => {
                sessionRep.query("aprobado(" + alumno + ", Curso), curso(Curso, _, _).");
                
                sessionRep.answers(function(answer) {
                    if (pl.type.is_substitution(answer)) {
                        const curso = answer.lookup("Curso");
                        console.log('🔄 CURSO APROBADO:', curso.id);
                        
                        repetidos.innerHTML += crearElementoBloqueado(
                            curso.id, 
                            'repetido', 
                            '✅ Ya aprobado'
                        );
                    }
                }, 1000);
            });
        }, 500);
        
        
        setTimeout(() => {
            actualizarResumenSimple(alumno);
        }, 2000);
        
    } catch (error) {
        console.error('💥 Error en consulta:', error);
        disponibles.innerHTML = '<div class="error">❌ Error: ' + error.message + '</div>';
    }
}

// Funciones auxiliares 
function crearCheckboxCurso(curso, creditos, semestre) {
    const nombreBonito = curso.split('_')
        .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
        .join(' ');
    
    return `
        <div class="curso-item disponible">
            <label class="curso-checkbox">
                <input type="checkbox" name="curso" value="${curso}" data-creditos="${creditos}" 
                       onchange="actualizarCreditos(this)">
                <div class="curso-info">
                    <span class="curso-nombre">${nombreBonito}</span>
                    <div class="curso-detalles">
                        <span class="curso-semestre">📅 Semestre ${semestre}</span>
                        <span class="curso-creditos">⚖️ ${creditos} créditos</span>
                    </div>
                </div>
            </label>
        </div>
    `;
}

function crearElementoBloqueado(curso, tipo, motivo) {
    const nombreBonito = curso.split('_')
        .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
        .join(' ');
    
    return `
        <div class="curso-item ${tipo}">
            <div class="curso-info">
                <span class="curso-nombre">${nombreBonito}</span>
                <div class="curso-motivo">${motivo}</div>
            </div>
        </div>
    `;
}

function actualizarCreditos(checkbox) {
    const creditos = parseInt(checkbox.dataset.creditos);
    
    if (checkbox.checked) {
        totalCreditosSeleccionados += creditos;
    } else {
        totalCreditosSeleccionados -= creditos;
    }
    
    actualizarContadorCreditos();
}

function actualizarContadorCreditos() {
    const elementoCreditos = document.getElementById('totalCreditos');
    if (elementoCreditos) {
        elementoCreditos.textContent = `Total créditos: ${totalCreditosSeleccionados}`;
        
        if (totalCreditosSeleccionados > LIMITE_CREDITOS) {
            elementoCreditos.classList.add('excedido');
        } else {
            elementoCreditos.classList.remove('excedido');
        }
    }
}

function actualizarResumenSimple(alumno) {
    const disponibles = document.querySelectorAll('.curso-item.disponible').length;
    const bloqueados = document.querySelectorAll('.curso-item.bloqueado').length;
    const repetidos = document.querySelectorAll('.curso-item.repetido').length;
    
    document.getElementById('cursosDisponibles').textContent = disponibles;
    document.getElementById('cursosAprobados').textContent = repetidos;
    document.getElementById('totalCursos').textContent = disponibles + bloqueados + repetidos;
    
    const porcentaje = Math.round((disponibles / (disponibles + bloqueados + repetidos)) * 100) || 0;
    document.getElementById('porcentajeAvance').textContent = porcentaje + '%';
}

function confirmarSeleccion(){
    if (totalCreditosSeleccionados > LIMITE_CREDITOS) {
        alert(`❌ Límite de créditos excedido: ${totalCreditosSeleccionados}/${LIMITE_CREDITOS} créditos`);
        return;
    }

    const seleccionados = document.querySelectorAll("input[name='curso']:checked");
    const salida = document.getElementById("seleccion_final");
    
    if (seleccionados.length === 0) {
        salida.innerHTML = '<div class="sin-seleccion"><p>⚠️ No has seleccionado ningún curso</p></div>';
        return;
    }

    let html = `
        <div class="seleccion-confirmada">
            <h3>🎉 Inscripción Confirmada</h3>
            <p>${seleccionados.length} curso(s) - ${totalCreditosSeleccionados} créditos</p>
            <div class="lista-seleccionados">
    `;

    seleccionados.forEach(curso => {
        const nombreFormateado = curso.value.split('_')
            .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
            .join(' ');
        const creditos = curso.dataset.creditos;
        html += `
            <div class="curso-seleccionado">
                <span class="curso-nombre">${nombreFormateado}</span>
                <span class="curso-creditos">${creditos} créditos</span>
            </div>
        `;
    });

    html += `
            </div>
            <div class="acciones-finales">
                <button class="btn-imprimir" onclick="imprimirHorario()">🖨️ Imprimir</button>
                <button class="btn-guardar" onclick="guardarSeleccion()">💾 Guardar</button>
            </div>
        </div>
    `;

    salida.innerHTML = html;
}

// Otras funciones
function verProgresoAcademico() {
    const alumno = document.getElementById("alumno").value;
    if (!alumno) {
        alert('❌ Selecciona un alumno primero');
        return;
    }
    alert(`📊 Progreso académico de ${alumno} - Función en desarrollo`);
}

function generarPlanEstudio() {
    alert('🎯 Generar plan de estudio - Función en desarrollo');
}

function reiniciarSistema() {
    document.getElementById("disponibles").innerHTML = '<div class="success">✅ Sistema listo</div>';
    document.getElementById("bloqueados").innerHTML = '';
    document.getElementById("repetidos").innerHTML = '';
    document.getElementById("seleccion_final").innerHTML = '<p class="placeholder">Aquí aparecerán los cursos seleccionados</p>';
    totalCreditosSeleccionados = 0;
    actualizarContadorCreditos();
}

function imprimirHorario() {
    alert('🖨️ Imprimir horario - Función en desarrollo');
}

function guardarSeleccion() {
    alert('💾 Guardar selección - Función en desarrollo');
}

// Inicializar cuando la página cargue
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Página cargada, inicializando sistema...');
    inicializarSistema();
});