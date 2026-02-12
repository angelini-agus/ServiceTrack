using CleanCheck.API.Data;
using Microsoft.EntityFrameworkCore;
using System;

var builder = WebApplication.CreateBuilder(args);

// 1. AGREGAR SERVICIOS (Antes del Build)
builder.Services.AddControllers();

// --- ESTAS 2 LINEAS ACTIVAN SWAGGER ---
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
// --------------------------------------

// Configurar la base de datos (lo que hicimos antes)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// 2. CONFIGURAR EL PIPELINE (Después del Build)
if (app.Environment.IsDevelopment())
{
    // --- ESTAS 2 LINEAS MUESTRAN LA PANTALLA AZUL ---
    app.UseSwagger();
    app.UseSwaggerUI();
    // ------------------------------------------------
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();