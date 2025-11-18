# Proyecto: Sistema de Selección de Cursos con Seriación (Prolog)

## Requisitos

- [SWI-Prolog](https://www.swi-prolog.org/)
- [Java 11+](https://adoptium.net/) + JPL (si usas la opción Java)
- O simplemente un navegador web (si usas la opción Tau-Prolog)

## Estructura

- `kb.pl`: Base de conocimiento con cursos, prerrequisitos y reglas.
- `Main.java`: Interfaz en Java que consulta la KB usando JPL.
- `index.html`: Interfaz web en JS usando Tau-Prolog.
- `README.md`: Este archivo.

## Cómo ejecutar

### Opción 1: Java + SWI-Prolog

1. Instalar SWI-Prolog y asegurarse de que JPL esté disponible.
2. Compilar:

   ```bash
   javac -cp ".:/usr/lib/swi-prolog/lib/jpl.jar" Main.java

## KB PL
% --- Definición de cursos ---
curso(matematicas1).
curso(matematicas2).
curso(fisica1).
curso(fisica2).
curso(programacion1).
curso(programacion2).
curso(ia).

% --- Seriación de cursos (prerrequisitos) ---
prerrequisito(matematicas2, matematicas1).
prerrequisito(fisica2, fisica1).
prerrequisito(programacion2, programacion1).
prerrequisito(ia, programacion2).
prerrequisito(ia, matematicas2).

% --- Registro dinámico de cursos aprobados ---
:- dynamic aprobado/2.
% aprobado(Alumno, Curso).

% --- Regla: un alumno puede inscribirse en un curso si cumple los prerrequisitos ---
puede_inscribirse(Alumno, Curso) :-
    curso(Curso),
    \+ aprobado(Alumno, Curso),
    forall(prerrequisito(Curso, Req), aprobado(Alumno, Req)).

% --- Marcar un curso como aprobado ---
aprobar(Alumno, Curso) :-
    curso(Curso),
    assertz(aprobado(Alumno, Curso)).

## MAIN JAVA
import org.jpl7.*;

public class Main {
    public static void main(String[] args) {
        // Cargar archivo Prolog
        Query q1 = new Query("consult('kb.pl')");
        System.out.println("Consultando kb.pl: " + (q1.hasSolution() ? "OK" : "Error"));

        // Aprobar matemáticas1 para juan
        Query q2 = new Query("aprobar(juan, matematicas1)");
        q2.hasSolution();

        // Consultar si puede inscribirse en matemáticas2
        Query q3 = new Query("puede_inscribirse(juan, X)");
        System.out.println("Cursos a los que puede inscribirse Juan:");
        while (q3.hasMoreSolutions()) {
            java.util.Map<String, Term> sol = q3.nextSolution();
            System.out.println("- " + sol.get("X"));
        }
    }
}

## INDEX HTML
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Selección de Cursos</title>
  <script src="https://cdn.jsdelivr.net/npm/tau-prolog/modules/core.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/tau-prolog/modules/lists.js"></script>
</head>
<body>
  <h2>Sistema de Selección de Cursos</h2>
  <button onclick="consultar()">Consultar cursos disponibles</button>
  <pre id="output"></pre>

  <script>
    const session = pl.create(1000);

    // Base de conocimiento (misma que kb.pl)
    const program = `
      curso(matematicas1).
      curso(matematicas2).
      curso(fisica1).
      curso(fisica2).
      curso(programacion1).
      curso(programacion2).
      curso(ia).

      prerrequisito(matematicas2, matematicas1).
      prerrequisito(fisica2, fisica1).
      prerrequisito(programacion2, programacion1).
      prerrequisito(ia, programacion2).
      prerrequisito(ia, matematicas2).

      :- dynamic aprobado/2.

      puede_inscribirse(Alumno, Curso) :-
          curso(Curso),
          \\+ aprobado(Alumno, Curso),
          forall(prerrequisito(Curso, Req), aprobado(Alumno, Req)).

      aprobar(Alumno, Curso) :- curso(Curso), assertz(aprobado(Alumno, Curso)).
      aprobar(juan, matematicas1).
    `;
    session.consult(program);

    function consultar() {
      session.query("puede_inscribirse(juan, X).");
      let output = "";
      session.answers(x => {
        if (x) output += pl.format_answer(x) + "\n";
        else document.getElementById("output").innerText = output || "Sin cursos disponibles.";
      });
    }
  </script>
</body>
</html>
