import { useState, useEffect } from 'react'

function App() {
  // 1. SEUS ESTADOS (Memória)
  const [metrics, setMetrics] = useState(null);
  const [showMetrics, setShowMetrics] = useState(false);

  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [teams, setTeams] = useState([])

  const [filterUserId, setFilterUserId] = useState('')
  const [filterTeamId, setFilterTeamId] = useState('')
  const [filterDeadline, setFilterDeadline] = useState("TODOS");

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

  const fetchMetrics = async () => {
    try {
      const response = await fetch("http://localhost:8080/metrics");
      const data = await response.json();
      setMetrics(data);
      setShowMetrics(true); // Abre o painel
    } catch (error) {
      console.error("Erro ao buscar métricas:", error);
    }
  };

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
    const filteredTasks = tasks.filter(task => {
      const matchStatus = task.status === statusName;

      const matchTeam = filterTeamId === "" || String(task.teamId) === String(filterTeamId);
      const matchUser = filterUserId === "" || String(task.userId) === String(filterUserId);

      let matchDeadline = true;
      if (filterDeadline === "ATRASADAS") {
        const hoje = new Date().toISOString().split("T")[0]; // Formato YYYY-MM-DD
        matchDeadline = task.dueDate < hoje && task.status !== "DONE";
      }

      return matchStatus && matchTeam && matchUser && matchDeadline;
    });

    return (
      <div className="flex flex-col w-1/3 min-h-[500px]">

        {/* CABEÇALHO SEPARADO COM EFEITO 3D E CANTOS PIXELADOS */}
        <div className={`border-4 border-slate-800 py-3 px-4 mb-3 pixel-corners retro-bevel ${bgColor}`}>
          <h2 className="text-2xl font-bold text-black text-center">{titleColumn} ({filteredTasks.length})</h2>
        </div>

        {/* ÁREA DAS TAREFAS COM FUNDO PONTILHADO E DROP ZONE */}
        <div
          className={`flex flex-col flex-1 border-4 border-slate-800 p-4 pixel-corners retro-bevel retro-dots ${bgColor}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const draggedTaskId = e.dataTransfer.getData('taskId');
            if (draggedTaskId) {
              updateStatus(Number(draggedTaskId), statusName);
            }
          }}
        >

          {filteredTasks.map(task => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
              className="bg-white border-4 border-slate-800 p-4 mb-3 shadow-[4px_4px_0_0_#1e293b] text-black pixel-corners cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform"
            >

              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-2xl leading-tight">{task.title}</h3>
                {task.team && (
                  <span className="bg-purple-300 text-black border-2 border-slate-800 text-sm font-bold px-2 py-1 rounded ml-2 shadow-[2px_2px_0_0_#1e293b]">
                    {task.team.name}
                  </span>
                )}
              </div>

              <p className="text-gray-700 text-lg mb-3">{task.description}</p>

              <div className="flex justify-between items-center mb-4 border-t-2 border-dashed border-gray-400 pt-2">
                {task.user && (
                  <div className="flex items-center gap-2 text-lg text-black font-medium">
                    <div className="w-6 h-6 bg-blue-300 border-2 border-slate-800 text-black flex items-center justify-center font-bold shadow-[2px_2px_0_0_#1e293b]">
                      {task.user.name.charAt(0)}
                    </div>
                    {task.user.name}
                  </div>
                )}

                {task.dueDate && (
                  <p className={`text-lg font-bold px-2 border-2 rounded shadow-[2px_2px_0_0_#1e293b] ${task.dueDate < new Date().toISOString().split("T")[0] && task.status !== 'DONE'
                    ? 'text-red-700 bg-red-200 border-red-600'
                    : 'text-green-800 bg-green-200 border-green-600'
                    }`}>
                    {formatDate(task.dueDate)}
                  </p>
                )}
              </div>

              <div className="flex justify-between gap-2 text-lg mb-2">
                <button onClick={() => startEditing(task)} className="bg-blue-400 text-black font-bold border-2 border-slate-800 px-2 py-1 rounded w-full shadow-[2px_2px_0_0_#1e293b] hover:bg-blue-500 hover:translate-y-[2px] hover:shadow-none transition-all">Editar</button>
                <button onClick={() => openDeleteModal(task.id)} className="bg-red-400 text-black font-bold border-2 border-slate-800 px-2 py-1 rounded w-full shadow-[2px_2px_0_0_#1e293b] hover:bg-red-500 hover:translate-y-[2px] hover:shadow-none transition-all">Excluir</button>
              </div>

              <div className="flex justify-between gap-2 text-lg">
                {statusName !== 'TODO' && (
                  <button onClick={() => updateStatus(task.id, statusName === 'DONE' ? 'DOING' : 'TODO')} className="bg-yellow-400 text-black font-bold border-2 border-slate-800 px-2 py-1 rounded w-full shadow-[2px_2px_0_0_#1e293b] hover:bg-yellow-500 hover:translate-y-[2px] hover:shadow-none transition-all">
                    &lt; Voltar
                  </button>
                )}
                {statusName !== 'DONE' && (
                  <button onClick={() => updateStatus(task.id, statusName === 'TODO' ? 'DOING' : 'DONE')} className="bg-green-400 text-black font-bold border-2 border-slate-800 px-2 py-1 rounded w-full shadow-[2px_2px_0_0_#1e293b] hover:bg-green-500 hover:translate-y-[2px] hover:shadow-none transition-all">
                    Avançar &gt;
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-slate-700 border-4 border-slate-800 p-6 rounded-lg shadow-[8px_8px_0_0_#1e293b]">

        {/* CABEÇALHO RETRO */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-[#ffe100] tracking-widest drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
            KANBAN CORPORATIVO
          </h1>

          {/* NOSSO NOVO GRUPO DE BOTÕES */}
          <div className="flex gap-4">
            <button
              onClick={fetchMetrics}
              className="bg-yellow-500 text-black border-4 border-slate-800 px-6 py-2 text-xl font-bold pixel-corners hover:bg-yellow-400 shadow-[4px_4px_0_0_#000] hover:translate-y-[4px] hover:shadow-none transition-all"
            >
              📊 ESTATÍSTICAS
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 text-white border-4 border-slate-800 px-6 py-2 text-xl font-bold pixel-corners hover:bg-blue-700 shadow-[4px_4px_0_0_#000] hover:translate-y-[4px] hover:shadow-none transition-all"
            >
              + NOVA TAREFA
            </button>
          </div>
        </div>

        {/* BARRA DE FILTROS RÁPIDOS (PÍLULAS) */}
        <div className="mb-8 bg-slate-700 border-4 border-slate-800 p-4 pixel-corners shadow-[4px_4px_0_0_#1e293b] flex flex-col gap-4">

          {/* LINHA 1: FILTRO DE EQUIPES */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-yellow-400 text-xl tracking-wide min-w-[160px]">EQUIPES:</span>
            <button
              onClick={() => setFilterTeamId("")}
              className={`px-4 py-1 font-bold text-lg border-2 border-slate-900 pixel-corners transition-all ${filterTeamId === ""
                ? "bg-yellow-400 text-black shadow-[inset_2px_2px_0_0_#000] translate-y-[2px]"
                : "bg-slate-800 text-white shadow-[2px_2px_0_0_#1e293b] hover:bg-slate-600 hover:-translate-y-[1px]"
                }`}
            >
              TODAS
            </button>
            {teams.map(t => (
              <button
                key={t.id}
                onClick={() => setFilterTeamId(t.id)}
                className={`px-4 py-1 font-bold text-lg border-2 border-slate-900 pixel-corners transition-all ${filterTeamId === t.id
                  ? "bg-purple-400 text-black shadow-[inset_2px_2px_0_0_#000] translate-y-[2px]"
                  : "bg-slate-800 text-white shadow-[2px_2px_0_0_#1e293b] hover:bg-slate-600 hover:-translate-y-[1px]"
                  }`}
              >
                {t.name.toUpperCase()}
              </button>
            ))}
          </div>

          {/* LINHA 2: FILTRO DE RESPONSÁVEIS */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-yellow-400 text-xl tracking-wide min-w-[160px]">RESPONSÁVEIS:</span>
            <button
              onClick={() => setFilterUserId("")}
              className={`px-4 py-1 font-bold text-lg border-2 border-slate-900 pixel-corners transition-all ${filterUserId === ""
                ? "bg-yellow-400 text-black shadow-[inset_2px_2px_0_0_#000] translate-y-[2px]"
                : "bg-slate-800 text-white shadow-[2px_2px_0_0_#1e293b] hover:bg-slate-600 hover:-translate-y-[1px]"
                }`}
            >
              TODOS
            </button>
            {users.map(u => (
              <button
                key={u.id}
                onClick={() => setFilterUserId(u.id)}
                className={`px-4 py-1 font-bold text-lg border-2 border-slate-900 pixel-corners transition-all ${filterUserId === u.id
                  ? "bg-blue-400 text-black shadow-[inset_2px_2px_0_0_#000] translate-y-[2px]"
                  : "bg-slate-800 text-white shadow-[2px_2px_0_0_#1e293b] hover:bg-slate-600 hover:-translate-y-[1px]"
                  }`}
              >
                {u.name.toUpperCase()}
              </button>
            ))}
          </div>

          {/* LINHA 3: FILTRO DE PRAZOS */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-yellow-400 text-xl tracking-wide min-w-[160px]">PRAZOS:</span>
            <button
              onClick={() => setFilterDeadline("TODOS")}
              className={`px-4 py-1 font-bold text-lg border-2 border-slate-900 pixel-corners transition-all ${filterDeadline === "TODOS"
                ? "bg-yellow-400 text-black shadow-[inset_2px_2px_0_0_#000] translate-y-[2px]"
                : "bg-slate-800 text-white shadow-[2px_2px_0_0_#1e293b] hover:bg-slate-600 hover:-translate-y-[1px]"
                }`}
            >
              TODOS OS PRAZOS
            </button>
            <button
              onClick={() => setFilterDeadline("ATRASADAS")}
              className={`px-4 py-1 font-bold text-lg border-2 border-slate-900 pixel-corners transition-all flex items-center gap-2 ${filterDeadline === "ATRASADAS"
                ? "bg-red-500 text-white shadow-[inset_2px_2px_0_0_#000] translate-y-[2px]"
                : "bg-slate-800 text-white shadow-[2px_2px_0_0_#1e293b] hover:bg-red-400 hover:text-black hover:-translate-y-[1px]"
                }`}
            >
              ⚠️ TAREFAS ATRASADAS
            </button>
          </div>

        </div>

        {/* COLUNAS COM CORES BASEADAS NA IMAGEM */}
        <div className="flex gap-6">
          {renderColumn('TODO', 'A FAZER', 'bg-slate-200')}
          {renderColumn('DOING', 'EM PROGRESSO', 'bg-blue-200')}
          {renderColumn('DONE', 'CONCLUÍDAS', 'bg-emerald-200')}
        </div>
      </div>
      {/* MODAL CENTRALIZADO DE EDIÇÃO */}
      {editingTaskId && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-700 border-4 border-slate-800 p-6 shadow-[8px_8px_0_0_#1e293b] max-w-md w-full relative rounded-md pixel-corners">

            <button onClick={() => setEditingTaskId(null)} className="absolute top-2 right-2 bg-red-500 text-white font-bold border-4 border-slate-800 px-2 shadow-[2px_2px_0_0_#000] hover:bg-red-600 hover:translate-y-[2px] hover:shadow-none transition-all">X</button>

            <h3 className="text-3xl font-bold text-white text-center mb-6 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">EDITAR TAREFA</h3>

            <form onSubmit={(e) => { e.preventDefault(); saveEdit(editingTaskId); }} className="flex flex-col gap-4">
              <div>
                <label className="block text-xl font-bold text-white mb-1">TÍTULO</label>
                <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="block w-full bg-slate-900 text-white border-4 border-slate-800 rounded p-2 text-xl outline-none shadow-[inset_4px_4px_0_0_#000] focus:border-yellow-400" required />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xl font-bold text-white mb-1">EQUIPE</label>
                  <select value={editTeamId} onChange={e => setEditTeamId(e.target.value)} className="block w-full bg-slate-900 text-white border-4 border-slate-800 rounded p-2 text-xl outline-none shadow-[inset_2px_2px_0_0_#000]" required>
                    <option value="">SELECIONE...</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name.toUpperCase()}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xl font-bold text-white mb-1">RESPONSÁVEL</label>
                  <select value={editUserId} onChange={e => setEditUserId(e.target.value)} className="block w-full bg-slate-900 text-white border-4 border-slate-800 rounded p-2 text-xl outline-none shadow-[inset_2px_2px_0_0_#000]" required>
                    <option value="">SELECIONE...</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xl font-bold text-white mb-1">DESCRIÇÃO</label>
                <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} className="block w-full bg-slate-900 text-white border-4 border-slate-800 rounded p-2 text-xl outline-none shadow-[inset_4px_4px_0_0_#000] focus:border-yellow-400" rows="3"></textarea>
              </div>

              <div>
                <label className="block text-xl font-bold text-white mb-1">PRAZO</label>
                <input type="date" value={editDueDate} onChange={e => setEditDueDate(e.target.value)} className="block w-full bg-slate-900 text-white border-4 border-slate-800 rounded p-2 text-xl outline-none shadow-[inset_4px_4px_0_0_#000] focus:border-yellow-400" style={{ colorScheme: "dark" }} />
              </div>

              <div className="flex justify-center gap-6 mt-4">
                <button type="button" onClick={() => setEditingTaskId(null)} className="px-6 py-2 bg-slate-500 text-white text-xl border-4 border-slate-800 rounded font-bold hover:bg-slate-600 shadow-[4px_4px_0_0_#000] hover:translate-y-[4px] hover:shadow-none transition-all">
                  CANCELAR
                </button>
                <button type="submit" className="px-6 py-2 bg-green-500 text-black text-xl border-4 border-slate-800 rounded font-bold hover:bg-green-600 shadow-[4px_4px_0_0_#000] hover:translate-y-[4px] hover:shadow-none transition-all">
                  SALVAR
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL DE CRIAÇÃO PIXEL ART */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-700 border-4 border-slate-800 p-6 shadow-[8px_8px_0_0_#1e293b] max-w-md w-full relative rounded-md pixel-corners">

            <button onClick={() => setIsCreateModalOpen(false)} className="absolute top-2 right-2 bg-blue-600 text-white font-bold border-4 border-slate-800 px-2 shadow-[2px_2px_0_0_#000] hover:bg-blue-700 hover:translate-y-[2px] hover:shadow-none">X</button>

            <h3 className="text-3xl font-bold text-white text-center mb-6 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">CRIAR NOVA TAREFA</h3>

            <form onSubmit={createTask} className="flex flex-col gap-4">
              <div>
                <label className="block text-xl font-bold text-white mb-1">TÍTULO <span className="text-yellow-400">*</span></label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="block w-full bg-slate-900 text-white border-4 border-slate-800 rounded p-2 text-xl outline-none shadow-[inset_4px_4px_0_0_#000] focus:border-yellow-400" required />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xl font-bold text-white mb-1">EQUIPE <span className="text-yellow-400">*</span></label>
                  <select value={teamId} onChange={e => setTeamId(e.target.value)} className="block w-full bg-slate-900 text-white border-4 border-slate-800 rounded p-2 text-xl outline-none shadow-[inset_2px_2px_0_0_#000]" required>
                    <option value="">SELECIONE...</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name.toUpperCase()}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xl font-bold text-white mb-1">RESPONSÁVEL <span className="text-yellow-400">*</span></label>
                  <select value={userId} onChange={e => setUserId(e.target.value)} className="block w-full bg-slate-900 text-white border-4 border-slate-800 rounded p-2 text-xl outline-none shadow-[inset_2px_2px_0_0_#000]" required>
                    <option value="">SELECIONE...</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xl font-bold text-white mb-1">DESCRIÇÃO</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="block w-full bg-slate-900 text-white border-4 border-slate-800 rounded p-2 text-xl outline-none shadow-[inset_4px_4px_0_0_#000] focus:border-yellow-400" rows="3"></textarea>
              </div>
              <div>
                <label className="block text-xl font-bold text-white mb-1">PRAZO</label>
                <input type="date" lang="pt-BR" value={dueDate} onChange={e => setDueDate(e.target.value)} className="block w-full bg-slate-900 text-white border-4 border-slate-800 rounded p-2 text-xl outline-none shadow-[inset_4px_4px_0_0_#000] focus:border-yellow-400" style={{ colorScheme: "dark" }} />
              </div>

              <div className="flex justify-center gap-6 mt-4">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2 bg-slate-500 text-white text-xl border-4 border-slate-800 rounded font-bold hover:bg-slate-600 shadow-[4px_4px_0_0_#000] hover:translate-y-[4px] hover:shadow-none transition-all">
                  CANCELAR
                </button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white text-xl border-4 border-slate-800 rounded font-bold hover:bg-blue-700 shadow-[4px_4px_0_0_#000] hover:translate-y-[4px] hover:shadow-none transition-all">
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
          <div className="bg-[#4f0d0d] border-4 border-slate-800 p-6 shadow-[8px_8px_0_0_#1e293b] max-w-sm w-full rounded-md text-center">
            <h3 className="text-3xl font-bold text-[#ff5555] mb-4 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">ATENÇÃO!</h3>
            <p className="text-white text-xl mb-6">Tem certeza que deseja apagar essa tarefa para sempre?</p>

            <div className="flex justify-center gap-4">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-gray-500 text-white text-xl font-bold border-4 border-slate-800 rounded shadow-[4px_4px_0_0_#000] hover:translate-y-[4px] hover:shadow-none">
                VOLTAR
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white text-xl font-bold border-4 border-slate-800 rounded shadow-[4px_4px_0_0_#000] hover:translate-y-[4px] hover:shadow-none">
                SIM, APAGAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ESTATÍSTICAS (HIGH SCORE) */}
      {showMetrics && metrics && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2d1b54] border-4 border-slate-800 p-8 shadow-[8px_8px_0_0_#000] text-white max-w-md w-full relative rounded-md">

            <button
              onClick={() => setShowMetrics(false)}
              className="absolute top-2 right-2 bg-red-600 border-4 border-slate-800 text-white px-3 py-1 text-xl font-bold hover:bg-red-500 hover:translate-y-[2px] shadow-[4px_4px_0_0_#000] hover:shadow-none transition-all"
            >
              X
            </button>

            <h2 className="text-3xl font-bold text-yellow-400 text-center mb-6 drop-shadow-[2px_2px_0_#000]">
              📈 HIGH SCORES
            </h2>

            <div className="flex flex-col gap-4 text-lg font-bold">
              <div className="flex justify-between bg-black bg-opacity-50 p-3 border-2 border-slate-800 shadow-[inset_2px_2px_0_0_#000]">
                <span>TOTAL DE TAREFAS:</span>
                <span className="text-blue-400">{metrics.total}</span>
              </div>
              <div className="flex justify-between bg-black bg-opacity-50 p-3 border-2 border-slate-800 shadow-[inset_2px_2px_0_0_#000]">
                <span>A FAZER (TODO):</span>
                <span className="text-gray-400">{metrics.todo}</span>
              </div>
              <div className="flex justify-between bg-black bg-opacity-50 p-3 border-2 border-slate-800 shadow-[inset_2px_2px_0_0_#000]">
                <span>EM PROGRESSO:</span>
                <span className="text-yellow-400">{metrics.doing}</span>
              </div>
              <div className="flex justify-between bg-black bg-opacity-50 p-3 border-2 border-slate-800 shadow-[inset_2px_2px_0_0_#000]">
                <span>CONCLUÍDAS:</span>
                <span className="text-green-400">{metrics.done}</span>
              </div>

              <div className={`flex justify-between p-3 border-2 shadow-[inset_2px_2px_0_0_#000] mt-2 transition-all duration-300 ${metrics.delayed > 0
                ? "bg-red-900 bg-opacity-80 border-red-500 border-dashed animate-pulse"
                : "bg-black bg-opacity-50 border-slate-800"
                }`}>
                <span className={metrics.delayed > 0 ? "text-red-300 font-bold" : "text-gray-400 font-bold"}>
                  {metrics.delayed > 0 ? "⚠️ ATRASADAS:" : "⚠️ ATRASADAS:"}
                </span>
                <span className={`font-bold ${metrics.delayed > 0 ? "text-red-400" : "text-green-500"}`}>
                  {metrics.delayed}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default App