// Inicializa la tabla de usuarios con DataTables
let dataTableUsuarios = new simpleDatatables.DataTable("#usuariosTable", {
    searchable: true,
    fixedHeight: true,
    perPage: 10
});

// Inicializa la tabla de roles con DataTables
let dataTableRoles = new simpleDatatables.DataTable("#rolesTable", {
    searchable: true,
    fixedHeight: true,
    perPage: 10
});
