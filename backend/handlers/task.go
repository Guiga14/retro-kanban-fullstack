package handlers

import (
	"kanban-api/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Ponte que cria a conexão com o banco
var DB *gorm.DB

func GetTeams(c *gin.Context) {
	var teams []models.Team
	DB.Find(&teams)
	c.JSON(http.StatusOK, teams)
}

func GetUsers(c *gin.Context) {
	var users []models.User
	DB.Preload("Team").Find(&users)
	c.JSON(http.StatusOK, users)
}

// --- FUNÇÕES DE TAREFAS ---

func GetTasks(c *gin.Context) {
	var tasks []models.Task

	// Inicia a query já carregando os dados do Usuário e da Equipe
	query := DB.Preload("User").Preload("Team")

	if userID := c.Query("userId"); userID != "" {
		query = query.Where("user_id = ?", userID)
	}
	if teamID := c.Query("teamId"); teamID != "" {
		query = query.Where("team_id = ?", teamID)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	query.Find(&tasks)

	c.JSON(http.StatusOK, tasks)
}

func CreateTask(c *gin.Context) {
	var newTask models.Task
	if err := c.ShouldBindJSON(&newTask); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if newTask.Status == "" {
		newTask.Status = "TODO"
	}

	DB.Create(&newTask)

	// Recarrega a tarefa com as estruturas do Usuário e Time para devolver completa
	DB.Preload("User").Preload("Team").First(&newTask, newTask.ID)

	c.JSON(http.StatusCreated, newTask)
}

func UpdateTaskStatus(c *gin.Context) {
	id := c.Param("id")

	var task models.Task
	if err := DB.First(&task, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Tarefa não encontrada"})
		return
	}

	var updateData models.Task
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if updateData.Status != "" {
		task.Status = updateData.Status
	}
	if updateData.Title != "" {
		task.Title = updateData.Title
	}
	if updateData.Description != "" {
		task.Description = updateData.Description
	}
	if updateData.DueDate != "" {
		task.DueDate = updateData.DueDate
	}

	if updateData.UserID != 0 {
		task.UserID = updateData.UserID
	}
	if updateData.TeamID != 0 {
		task.TeamID = updateData.TeamID
	}

	DB.Save(&task)

	// Recarrega os relacionamentos para enviar os nomes corretos de volta
	DB.Preload("User").Preload("Team").First(&task, task.ID)

	c.JSON(http.StatusOK, task)
}

func DeleteTask(c *gin.Context) {
	id := c.Param("id")

	DB.Delete(&models.Task{}, id)

	c.JSON(http.StatusOK, gin.H{"message": "Deletado com sucesso"})
}
