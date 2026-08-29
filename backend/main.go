package main

import (
	"kanban-api/handlers"
	"kanban-api/models"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

// Função que liga o motor do banco de dados
func conectarBanco() {
	dsn := "host=localhost user=postgres password=0411 dbname=kanban_db port=5432 sslmode=disable"

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Falha ao conectar com o banco de dados!")
	}

	DB.AutoMigrate(&models.Team{}, &models.User{}, &models.Task{})

	seedDatabase(DB)
}

// Função para semear o banco com times e usuários de teste
func seedDatabase(db *gorm.DB) {
	var count int64

	db.Model(&models.Team{}).Count(&count)

	if count == 0 {
		// Cria os Times
		teams := []models.Team{
			{Name: "Backend"},
			{Name: "Frontend"},
			{Name: "Design"},
		}
		db.Create(&teams)
		log.Println("Times iniciais criados com sucesso!")

		// Cria os Usuários vinculados aos times
		users := []models.User{
			{Name: "Guilherme", TeamID: teams[0].ID},
			{Name: "Josefa", TeamID: teams[1].ID},
			{Name: "Arlinda", TeamID: teams[2].ID},
		}
		db.Create(&users)
		log.Println("Usuários iniciais criados com sucesso!")
	}
}

func main() {
	conectarBanco()

	handlers.DB = DB

	r := gin.Default()
	r.Use(cors.Default())

	r.GET("/tasks", handlers.GetTasks)
	r.POST("/tasks", handlers.CreateTask)
	r.PUT("/tasks/:id", handlers.UpdateTaskStatus)
	r.DELETE("/tasks/:id", handlers.DeleteTask)

	r.GET("/teams", handlers.GetTeams)
	r.GET("/users", handlers.GetUsers)

	// NOVA ROTA DE MÉTRICAS (Pode colar na linha 73)
	r.GET("/metrics", handlers.GetMetrics)

	r.Run(":8080")
}
