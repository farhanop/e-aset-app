// components/development/FullDevPage.tsx
import React, { ReactNode, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  AlertTriangle, 
  Crown, 
  Calendar, 
  Tag, 
  Code, 
  Rocket, 
  Zap, 
  Shield,
  ArrowLeft,
  Sparkles,
  Home,
  CheckSquare,
  List,
  Plus,
  Trash2,
  Edit3,
  Save,
  X
} from 'lucide-react';

interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  description?: string;
  dueDate?: string;
  assignee?: string;
}

interface FullDevPageProps {
  children: ReactNode;
  moduleName: string;
  releaseDate?: string;
  version?: string;
  issues?: string[];
  developerNotes?: string[];
  progress?: number;
  tasks?: TaskItem[];
  onTaskToggle?: (taskId: string) => void;
  onTasksUpdate?: (tasks: TaskItem[]) => void;
  onBackToMenu?: () => void;
}

const FullDevPage: React.FC<FullDevPageProps> = ({ 
  children, 
  moduleName, 
  releaseDate = 'Coming Soon',
  version = '0.1.0',
  issues = [],
  developerNotes = [],
  progress = 65,
  tasks = [],
  onTaskToggle,
  onTasksUpdate,
  onBackToMenu
}) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super-admin';
  
  // State untuk task management
  const [taskList, setTaskList] = useState<TaskItem[]>(tasks);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState<Partial<TaskItem>>({
    title: '',
    priority: 'medium',
    description: '',
    dueDate: '',
    assignee: user?.nama_lengkap || 'Developer'
  });
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Jika bukan super admin, tampilkan halaman akses ditolak
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center border border-orange-200 dark:border-orange-800/50">
          {/* Animated Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping"></div>
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-2xl relative z-10 shadow-lg">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent mb-3">
            Development Preview
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Modul <span className="font-semibold text-orange-600 dark:text-orange-400">{moduleName}</span> sedang dalam tahap pengembangan aktif dan hanya dapat diakses oleh Super Admin.
          </p>

          {/* Info Card */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Rilis: {releaseDate}</span>
              </div>
              <div className="w-px h-4 bg-yellow-300 dark:bg-yellow-600"></div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">v{version}</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-yellow-600 dark:text-yellow-400 mb-1">
                <span>Progress Development</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-yellow-200 dark:bg-yellow-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onBackToMenu || (() => window.history.back())}
              className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Menu Utama
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Hitung persentase tugas yang selesai
  const completedTasks = taskList.filter(task => task.completed).length;
  const totalTasks = taskList.length;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Handler untuk toggle task completion
  const handleTaskToggle = (taskId: string) => {
    const updatedTasks = taskList.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTaskList(updatedTasks);
    onTaskToggle?.(taskId);
    onTasksUpdate?.(updatedTasks);
  };

  // Handler untuk menambah task baru
  const handleAddTask = () => {
    if (!newTask.title?.trim()) return;

    const task: TaskItem = {
      id: Date.now().toString(),
      title: newTask.title,
      completed: false,
      priority: newTask.priority || 'medium',
      description: newTask.description,
      dueDate: newTask.dueDate,
      assignee: newTask.assignee
    };

    const updatedTasks = [...taskList, task];
    setTaskList(updatedTasks);
    onTasksUpdate?.(updatedTasks);
    setNewTask({
      title: '',
      priority: 'medium',
      description: '',
      dueDate: '',
      assignee: user?.nama_lengkap || 'Developer'
    });
    setIsAddingTask(false);
  };

  // Handler untuk menghapus task
  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = taskList.filter(task => task.id !== taskId);
    setTaskList(updatedTasks);
    onTasksUpdate?.(updatedTasks);
  };

  // Handler untuk edit task
  const handleEditTask = (taskId: string) => {
    setEditingTaskId(taskId);
  };

  // Handler untuk save edit task
  const handleSaveEdit = (taskId: string, updates: Partial<TaskItem>) => {
    const updatedTasks = taskList.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    );
    setTaskList(updatedTasks);
    onTasksUpdate?.(updatedTasks);
    setEditingTaskId(null);
  };

  // Handler untuk cancel edit
  const handleCancelEdit = () => {
    setEditingTaskId(null);
  };

  // Priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  // Priority label
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Tinggi';
      case 'medium':
        return 'Sedang';
      case 'low':
        return 'Rendah';
      default:
        return priority;
    }
  };
  
  // Jika super admin, tampilkan halaman dengan banner development
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Enhanced Development Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Super Admin Development Mode</h1>
              <p className="text-blue-100 text-sm">Preview: {moduleName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
              <Rocket className="w-3 h-3" />
              <span className="text-xs font-medium">v{version}</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              <span className="text-xs font-medium">{releaseDate}</span>
            </div>
            <button
              onClick={onBackToMenu || (() => window.history.back())}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-lg transition-all duration-300"
              title="Kembali"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-lg transition-all duration-300"
              title="Menu Utama"
            >
              <Home className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Development Info Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-blue-200 dark:border-blue-800/50">
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
              <Code className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Development Preview
                </h2>
                <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Active Development
                </span>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                Anda sedang mengakses modul <span className="font-semibold text-blue-600 dark:text-blue-400">{moduleName}</span> dalam tahap pengembangan. 
                Fitur mungkin belum stabil dan tersedia untuk testing purposes.
              </p>

              {/* Progress Section */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Progress Development</span>
                  <span>{progress}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-inner"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Task Progress Section */}
              {taskList.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span className="flex items-center gap-1">
                      <CheckSquare className="w-4 h-4" />
                      Task Progress ({completedTasks}/{totalTasks})
                    </span>
                    <span>{taskProgress}% Selesai</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-400 to-pink-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-inner"
                      style={{ width: `${taskProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Issues & Notes & Tasks Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Known Issues */}
                {issues.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <h3 className="font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Known Issues
                    </h3>
                    <ul className="space-y-2">
                      {issues.map((issue, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-red-700 dark:text-red-400">
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Developer Notes */}
                {developerNotes.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Developer Notes
                    </h3>
                    <ul className="space-y-2">
                      {developerNotes.map((note, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-400">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Task Checklist */}
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-purple-800 dark:text-purple-300 flex items-center gap-2">
                      <List className="w-4 h-4" />
                      Task Checklist
                    </h3>
                    <button
                      onClick={() => setIsAddingTask(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white p-1.5 rounded-lg transition-colors duration-200"
                      title="Tambah Task Baru"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add Task Form */}
                  {isAddingTask && (
                    <div className="mb-4 p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-purple-200 dark:border-purple-700">
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Judul task..."
                          value={newTask.title}
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                          autoFocus
                        />
                        
                        <select
                          value={newTask.priority}
                          onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        >
                          <option value="low">Prioritas Rendah</option>
                          <option value="medium">Prioritas Sedang</option>
                          <option value="high">Prioritas Tinggi</option>
                        </select>

                        <input
                          type="date"
                          placeholder="Tanggal target"
                          value={newTask.dueDate}
                          onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        />

                        <div className="flex gap-2">
                          <button
                            onClick={handleAddTask}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm transition-colors duration-200"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => setIsAddingTask(false)}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded-lg text-sm transition-colors duration-200"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Task List */}
                  <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {taskList.length === 0 ? (
                      <li className="text-center text-sm text-purple-600 dark:text-purple-400 py-4">
                        Belum ada task. Klik + untuk menambah task.
                      </li>
                    ) : (
                      taskList.map((task) => (
                        <li 
                          key={task.id} 
                          className={`flex items-start gap-2 p-3 rounded-lg transition-all duration-200 ${
                            task.completed 
                              ? 'text-green-700 dark:text-green-400 bg-green-50/50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                              : 'text-purple-700 dark:text-purple-400 bg-white/50 dark:bg-gray-700/50 border border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/10'
                          }`}
                        >
                          {/* Checkbox */}
                          <button
                            onClick={() => handleTaskToggle(task.id)}
                            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-200 ${
                              task.completed 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'border-purple-400 text-transparent hover:border-purple-600 hover:bg-purple-100 dark:hover:bg-purple-800'
                            }`}
                          >
                            {task.completed && <CheckSquare className="w-3 h-3" />}
                          </button>

                          {/* Task Content */}
                          <div className="flex-1 min-w-0">
                            {editingTaskId === task.id ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={task.title}
                                  onChange={(e) => {
                                    const updatedTasks = taskList.map(t =>
                                      t.id === task.id ? { ...t, title: e.target.value } : t
                                    );
                                    setTaskList(updatedTasks);
                                  }}
                                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleSaveEdit(task.id, { title: task.title })}
                                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs transition-colors duration-200"
                                  >
                                    <Save className="w-3 h-3 inline mr-1" />
                                    Simpan
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs transition-colors duration-200"
                                  >
                                    <X className="w-3 h-3 inline mr-1" />
                                    Batal
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className={`font-medium ${task.completed ? 'line-through' : ''}`}>
                                  {task.title}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority || 'medium')}`}>
                                    {getPriorityLabel(task.priority || 'medium')}
                                  </span>
                                  {task.dueDate && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {new Date(task.dueDate).toLocaleDateString('id-ID')}
                                    </span>
                                  )}
                                  {task.assignee && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {task.assignee}
                                    </span>
                                  )}
                                </div>
                              </>
                            )}
                          </div>

                          {/* Action Buttons */}
                          {editingTaskId !== task.id && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => handleEditTask(task.id)}
                                className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                                title="Edit Task"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                                title="Hapus Task"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </li>
                      ))
                    )}
                  </ul>

                  {/* Task Summary */}
                  {taskList.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700">
                      <div className="flex justify-between text-xs text-purple-600 dark:text-purple-400">
                        <span>Total: {totalTasks} task</span>
                        <span>Selesai: {completedTasks}</span>
                        <span>Progress: {taskProgress}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Super Admin Access
                  </span>
                  <span>Environment: {process.env.NODE_ENV}</span>
                  <span>Last Updated: {new Date().toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Module Content */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Rocket className="w-5 h-5 text-blue-500" />
              {moduleName} - Live Preview
            </h3>
          </div>
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullDevPage;