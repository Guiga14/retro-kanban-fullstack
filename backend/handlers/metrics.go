package handlers

import (
	"kanban-api/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func GetMetrics(c *gin.Context) {
	var total int64
	var todo int64
	var doing int64
	var done int64
	var delayed int64

	// 1. Contagens básicas de cada coluna
	DB.Model(&models.Task{}).Count(&total)
	DB.Model(&models.Task{}).Where("status = ?", "TODO").Count(&todo)
	DB.Model(&models.Task{}).Where("status = ?", "DOING").Count(&doing)
	DB.Model(&models.Task{}).Where("status = ?", "DONE").Count(&done)

	// 2. Lógica de Atraso
	hoje := time.Now().Format("2006-01-02")

	DB.Model(&models.Task{}).
		Where("status != ?", "DONE").
		Where("due_date < ? AND due_date != ?", hoje, "").
		Count(&delayed)

	// 3. Devolvemos tudo empacotado em um JSON para o Front-end
	c.JSON(http.StatusOK, gin.H{
		"total":   total,
		"todo":    todo,
		"doing":   doing,
		"done":    done,
		"delayed": delayed,
	})
}
