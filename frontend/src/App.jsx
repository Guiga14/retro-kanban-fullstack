import { useState, useEffect } from 'react'

function App() {
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [teams, setTeams] = useState([])

  const [filterUserId, setFilterUserId] = useState('')
  const [filterTeamId, setFilterTeamId] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [userId, setUserId] = useState('')
  const [teamId, setTeamId] = useState('')

  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDueDate, setEditDueDate] = useState('')
  const [editUserId, setEditUserId] = useState('')
  const [editTeamId, setEditTeamId] = useState('')

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const API_URL = 'http://localhost:8080'

  useEffect(() => {
    fetchUsers()
    fetchTeams()
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [filterUserId, filterTeamId])

  const fetchUsers = async () => {
    const res = await fetch(`${API_URL}/users`)
    const data = await res.json()
    setUsers(data || [])
  }

  const fetchTeams = async () => {
    const res = await fetch(`${API_URL}/teams`)
    const data = await res.json()
    setTeams(data || [])
  }

  const fetchTasks = async () => {
    let url = `${API_URL}/tasks?`
    if (filterUserId) url += `userId=${filterUserId}&`
    if (filterTeamId) url += `teamId=${filterTeamId}&`

    const response = await fetch(url)
    const data = await response.json()
    setTasks(data || [])
  }

  const createTask = async (e) => {
    e.preventDefault()
    if (!title || !userId || !teamId) return alert('Título, Responsável e Equipe são obrigatórios!')

    const newTask = { 
      title, description, status: 'TODO', dueDate,
      userId: parseInt(userId), teamId: parseInt(teamId)
    }

    await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask)
    })

    setTitle('')
    setDescription('')
    setDueDate('')
    setUserId('')
    setTeamId('')
    setIsCreateModalOpen(false) 
    fetchTasks()
  }

  const updateStatus = async (id, newStatus) => {
    await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    fetchTasks()
  }

  const startEditing = (task) => {
    setEditingTaskId(task.id)
    setEditTitle(task.title)
    setEditDescription(task.description)
    setEditDueDate(task.dueDate || '')
    setEditUserId(task.userId)
    setEditTeamId(task.teamId)
  }

  const saveEdit = async (id) => {
    await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title: editTitle, description: editDescription, dueDate: editDueDate,
        userId: parseInt(editUserId), teamId: parseInt(editTeamId)
      })
    })
    setEditingTaskId(null)
    fetchTasks()
  }

  const openDeleteModal = (id) => {
    setTaskToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (taskToDelete) {
      await fetch(`${API_URL}/tasks/${taskToDelete}`, { method: 'DELETE' })
      fetchTasks()
      setIsDeleteModalOpen(false)
      setTaskToDelete(null)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const parts = dateString.split('-')
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }

const renderColumn = (statusName, titleColumn, bgColor) => {
    const filteredTasks = tasks.filter(task => task.status === statusName)

    return (
      <div className="flex flex-col w-1/3 min-h-[500px]">
        
        {/* CABEÇALHO SEPARADO COM EFEITO 3D E CANTOS PIXELADOS */}
        <div className={`border-4 border-black py-3 px-4 mb-3 pixel-corners retro-bevel ${bgColor}`}>
          <h2 className="text-2xl font-bold text-black text-center">{titleColumn} ({filteredTasks.length})</h2>
        </div>
        
        {/* ÁREA DAS TAREFAS COM FUNDO PONTILHADO */}
        <div className={`flex flex-col flex-1 border-4 border-black p-4 pixel-corners retro-bevel retro-dots ${bgColor}`}>
          
          {filteredTasks.map(task => (
            <div key={task.id} className="bg-white border-4 border-black p-4 mb-3 shadow-[4px_4px_0_0_#000000] text-black pixel-corners">
              
              {editingTaskId === task.id ? (
                <div className="flex flex-col gap-2">
                  <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="border-2 border-black p-1 text-lg rounded bg-gray-100 outline-none focus:border-yellow-500" placeholder="Título" />
                  <input type="text" value={editDescription} onChange={e => setEditDescription(e.target.value)} className="border-2 border-black p-1 text-lg rounded bg-gray-100 outline-none focus:border-yellow-500" placeholder="Descrição" />
                  
                  <select value={editTeamId} onChange={e => setEditTeamId(e.target.value)} className="border-2 border-black p-1 text-lg rounded bg-gray-100 outline-none">
                    <option value="">Selecione a Equipe</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>

                  <select value={editUserId} onChange={e => setEditUserId(e.target.value)} className="border-2 border-black p-1 text-lg rounded bg-gray-100 outline-none">
                    <option value="">Selecione o Responsável</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>

                  <input type="date" value={editDueDate} onChange={e => setEditDueDate(e.target.value)} className="border-2 border-black p-1 text-lg rounded bg-gray-100 outline-none" />
                  
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => saveEdit(task.id)} className="bg-green-500 text-black border-2 border-black px-2 py-1 rounded text-lg w-full shadow-[2px_2px_0_0_#000] hover:translate-y-[2px] hover:shadow-none active:translate-y-[2px] active:shadow-none">Salvar</button>
                    <button onClick={() => setEditingTaskId(null)} className="bg-gray-400 text-black border-2 border-black px-2 py-1 rounded text-lg w-full shadow-[2px_2px_0_0_#000] hover:translate-y-[2px] hover:shadow-none active:translate-y-[2px] active:shadow-none">Cancelar</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-2xl leading-tight">{task.title}</h3>
                    {task.team && (
                      <span className="bg-purple-300 text-black border-2 border-black text-sm font-bold px-2 py-1 rounded ml-2 shadow-[2px_2px_0_0_#000]">
                        {task.team.name}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-700 text-lg mb-3">{task.description}</p>
                  
                  <div className="flex justify-between items-center mb-4 border-t-2 border-dashed border-gray-400 pt-2">
                     {task.user && (
                      <div className="flex items-center gap-2 text-lg text-black font-medium">
                        <div className="w-6 h-6 bg-blue-300 border-2 border-black text-black flex items-center justify-center font-bold shadow-[2px_2px_0_0_#000]">
                          {task.user.name.charAt(0)}
                        </div>
                        {task.user.name}
                      </div>
                    )}

                    {task.dueDate && (
                      <p className="text-lg font-bold text-red-600 bg-red-100 px-2 border-2 border-red-600 rounded">
                        {formatDate(task.dueDate)}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex justify-between gap-2 text-lg mb-2">
                     <button onClick={() => startEditing(task)} className="bg-blue-400 text-black font-bold border-2 border-black px-2 py-1 rounded w-full shadow-[2px_2px_0_0_#000] hover:bg-blue-500 hover:translate-y-[2px] hover:shadow-none transition-all">Editar</button>
                     <button onClick={() => openDeleteModal(task.id)} className="bg-red-400 text-black font-bold border-2 border-black px-2 py-1 rounded w-full shadow-[2px_2px_0_0_#000] hover:bg-red-500 hover:translate-y-[2px] hover:shadow-none transition-all">Excluir</button>
                  </div>

                  <div className="flex justify-between gap-2 text-lg">
                    {statusName !== 'TODO' && (
                      <button onClick={() => updateStatus(task.id, statusName === 'DONE' ? 'DOING' : 'TODO')} className="bg-yellow-400 text-black font-bold border-2 border-black px-2 py-1 rounded w-full shadow-[2px_2px_0_0_#000] hover:bg-yellow-500 hover:translate-y-[2px] hover:shadow-none transition-all">
                        &lt; Voltar
                      </button>
                    )}
                    {statusName !== 'DONE' && (
                      <button onClick={() => updateStatus(task.id, statusName === 'TODO' ? 'DOING' : 'DONE')} className="bg-green-400 text-black font-bold border-2 border-black px-2 py-1 rounded w-full shadow-[2px_2px_0_0_#000] hover:bg-green-500 hover:translate-y-[2px] hover:shadow-none transition-all">
                        Avançar &gt;
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#070b24] p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-[#171c4c] border-4 border-black p-6 rounded-lg shadow-[8px_8px_0_0_#000000]">
        
        {/* CABEÇALHO RETRO */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-[#ffe100] tracking-widest drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
            KANBAN CORPORATIVO
          </h1>
          <button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="bg-blue-600 text-white border-4 border-black px-6 py-2 text-xl font-bold pixel-corners hover:bg-blue-700 shadow-[4px_4px_0_0_#000] hover:translate-y-[4px] hover:shadow-none transition-all"
          >
            + NOVA TAREFA
          </button>
        </div>

        {/* BARRA DE FILTROS ESTILIZADA */}
        <div className="mb-8 bg-[#2d1b54] border-4 border-black p-4 pixel-corners shadow-[4px_4px_0_0_#000000] flex gap-4 items-center">
          <span className="font-bold text-white text-xl tracking-wide">FILTROS:</span>
          
          <select 
            value={filterTeamId} 
            onChange={e => setFilterTeamId(e.target.value)} 
            className="bg-[#4a3480] text-white border-4 border-black rounded p-2 text-xl outline-none shadow-[inset_2px_2px_0_0_#000000] cursor-pointer"
          >
            <option value="">TODAS AS EQUIPES</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name.toUpperCase()}</option>)}
          </select>

          <select 
            value={filterUserId} 
            onChange={e => setFilterUserId(e.target.value)} 
            className="bg-[#4a3480] text-white border-4 border-black rounded p-2 text-xl outline-none shadow-[inset_2px_2px_0_0_#000000] cursor-pointer"
          >
            <option value="">TODOS OS RESPONSÁVEIS</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name.toUpperCase()}</option>)}
          </select>
        </div>

        {/* COLUNAS COM CORES BASEADAS NA IMAGEM */}
        <div className="flex gap-6">
          {renderColumn('TODO', 'A FAZER', 'bg-[#858d98]')}
          {renderColumn('DOING', 'EM PROGRESSO', 'bg-[#87a5e8]')}
          {renderColumn('DONE', 'CONCLUÍDAS', 'bg-[#96ce99]')}
        </div>
      </div>

      {/* MODAL DE CRIAÇÃO PIXEL ART */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1b5e] border-4 border-black p-6 shadow-[8px_8px_0_0_#000000] max-w-md w-full relative rounded-md">
            
            <button onClick={() => setIsCreateModalOpen(false)} className="absolute top-2 right-2 bg-blue-600 text-white font-bold border-4 border-black px-2 shadow-[2px_2px_0_0_#000] hover:bg-blue-700 hover:translate-y-[2px] hover:shadow-none">X</button>
            
            <h3 className="text-3xl font-bold text-white text-center mb-6 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">CRIAR NOVA TAREFA</h3>

            <form onSubmit={createTask} className="flex flex-col gap-4">
              <div>
                <label className="block text-xl font-bold text-white mb-1">TÍTULO <span className="text-yellow-400">*</span></label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="block w-full bg-[#090b2e] text-white border-4 border-black rounded p-2 text-xl outline-none shadow-[inset_4px_4px_0_0_#000000] focus:border-yellow-400" required />
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xl font-bold text-white mb-1">EQUIPE <span className="text-yellow-400">*</span></label>
                  <select value={teamId} onChange={e => setTeamId(e.target.value)} className="block w-full bg-[#4a3480] text-white border-4 border-black rounded p-2 text-xl outline-none shadow-[inset_2px_2px_0_0_#000000]" required>
                    <option value="">SELECIONE...</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name.toUpperCase()}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xl font-bold text-white mb-1">RESPONSÁVEL <span className="text-yellow-400">*</span></label>
                  <select value={userId} onChange={e => setUserId(e.target.value)} className="block w-full bg-[#4a3480] text-white border-4 border-black rounded p-2 text-xl outline-none shadow-[inset_2px_2px_0_0_#000000]" required>
                    <option value="">SELECIONE...</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xl font-bold text-white mb-1">DESCRIÇÃO</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="block w-full bg-[#090b2e] text-white border-4 border-black rounded p-2 text-xl outline-none shadow-[inset_4px_4px_0_0_#000000] focus:border-yellow-400" rows="3"></textarea>
              </div>
              <div>
                <label className="block text-xl font-bold text-white mb-1">PRAZO</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="block w-full bg-[#090b2e] text-white border-4 border-black rounded p-2 text-xl outline-none shadow-[inset_4px_4px_0_0_#000000] focus:border-yellow-400" style={{colorScheme: "dark"}} />
              </div>

              <div className="flex justify-center gap-6 mt-4">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2 bg-gray-500 text-white text-xl border-4 border-black rounded font-bold hover:bg-gray-600 shadow-[4px_4px_0_0_#000] hover:translate-y-[4px] hover:shadow-none transition-all">
                  CANCELAR
                </button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white text-xl border-4 border-black rounded font-bold hover:bg-blue-700 shadow-[4px_4px_0_0_#000] hover:translate-y-[4px] hover:shadow-none transition-all">
                  SALVAR TAREFA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE EXCLUSÃO RETRO */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#4f0d0d] border-4 border-black p-6 shadow-[8px_8px_0_0_#000000] max-w-sm w-full rounded-md text-center">
            <h3 className="text-3xl font-bold text-[#ff5555] mb-4 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">ATENÇÃO!</h3>
            <p className="text-white text-xl mb-6">Tem certeza que deseja apagar essa tarefa para sempre?</p>
            
            <div className="flex justify-center gap-4">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-gray-500 text-white text-xl font-bold border-4 border-black rounded shadow-[4px_4px_0_0_#000] hover:translate-y-[4px] hover:shadow-none">
                VOLTAR
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white text-xl font-bold border-4 border-black rounded shadow-[4px_4px_0_0_#000] hover:translate-y-[4px] hover:shadow-none">
                SIM, APAGAR
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default App