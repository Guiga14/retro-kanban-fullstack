package models

// 1. Tabela de Equipes
type Team struct {
	ID   uint   `json:"id" gorm:"primaryKey"`
	Name string `json:"name"`
}

// 2. Tabela de Usuários
type User struct {
	ID     uint   `json:"id" gorm:"primaryKey"`
	Name   string `json:"name"`
	TeamID uint   `json:"teamId"` // O usuário pertence a uma equipe
	Team   Team   `json:"team" gorm:"foreignKey:TeamID"`
}

// 3. A sua Tabela de Tarefas Atualizada
type Task struct {
	ID          uint   `json:"id" gorm:"primaryKey"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
	DueDate     string `json:"dueDate"`

	// NOVAS CHAVES ESTRANGEIRAS

	UserID uint `json:"userId"`
	User   User `json:"user" gorm:"foreignKey:UserID"`

	TeamID uint `json:"teamId"`
	Team   Team `json:"team" gorm:"foreignKey:TeamID"`
}
