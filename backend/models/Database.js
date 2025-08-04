const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class Database {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
    this.ensureDataDirectory();
    this.initializeFiles();
  }

  ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  initializeFiles() {
    const files = [
      'psicologos.json',
      'especialidades.json',
      'horarios.json',
      'reservas.json',
      'usuarios.json'
    ];

    files.forEach(filename => {
      const filePath = path.join(this.dataDir, filename);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      }
    });

    // Inicializar especialidades por defecto
    this.initializeEspecialidades();
  }

  initializeEspecialidades() {
    const especialidadesPath = path.join(this.dataDir, 'especialidades.json');
    const especialidades = this.readFile('especialidades.json');
    
    if (especialidades.length === 0) {
      const especialidadesDefault = [
        { id: uuidv4(), nombre: 'Ansiedad', descripcion: 'Tratamiento de trastornos de ansiedad' },
        { id: uuidv4(), nombre: 'Depresión', descripcion: 'Tratamiento de trastornos depresivos' },
        { id: uuidv4(), nombre: 'Terapia de Pareja', descripcion: 'Counseling y terapia para parejas' },
        { id: uuidv4(), nombre: 'Terapia Familiar', descripcion: 'Terapia sistémica familiar' },
        { id: uuidv4(), nombre: 'Trauma', descripcion: 'Tratamiento de PTSD y trauma' },
        { id: uuidv4(), nombre: 'Adicciones', descripcion: 'Tratamiento de adicciones' },
        { id: uuidv4(), nombre: 'Trastornos Alimentarios', descripcion: 'Tratamiento de TCA' },
        { id: uuidv4(), nombre: 'Terapia Cognitivo Conductual', descripcion: 'TCC' },
        { id: uuidv4(), nombre: 'Psicología Infantil', descripcion: 'Psicología para niños y adolescentes' },
        { id: uuidv4(), nombre: 'Autoestima', descripcion: 'Fortalecimiento de la autoestima' }
      ];
      
      this.writeFile('especialidades.json', especialidadesDefault);
    }
  }

  readFile(filename) {
    try {
      const filePath = path.join(this.dataDir, filename);
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error al leer ${filename}:`, error);
      return [];
    }
  }

  writeFile(filename, data) {
    try {
      const filePath = path.join(this.dataDir, filename);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error al escribir ${filename}:`, error);
      return false;
    }
  }

  // CRUD genérico
  create(collection, item) {
    const data = this.readFile(`${collection}.json`);
    const newItem = { ...item, id: uuidv4(), createdAt: new Date().toISOString() };
    data.push(newItem);
    this.writeFile(`${collection}.json`, data);
    return newItem;
  }

  findAll(collection) {
    return this.readFile(`${collection}.json`);
  }

  findById(collection, id) {
    const data = this.readFile(`${collection}.json`);
    return data.find(item => item.id === id);
  }

  update(collection, id, updates) {
    const data = this.readFile(`${collection}.json`);
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) return null;
    
    data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
    this.writeFile(`${collection}.json`, data);
    return data[index];
  }

  delete(collection, id) {
    const data = this.readFile(`${collection}.json`);
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) return false;
    
    data.splice(index, 1);
    this.writeFile(`${collection}.json`, data);
    return true;
  }

  // Métodos específicos para búsquedas
  findByQuery(collection, query) {
    const data = this.readFile(`${collection}.json`);
    return data.filter(item => {
      return Object.keys(query).every(key => {
        if (Array.isArray(item[key])) {
          return item[key].some(val => 
            val.toString().toLowerCase().includes(query[key].toString().toLowerCase())
          );
        }
        return item[key]?.toString().toLowerCase().includes(query[key].toString().toLowerCase());
      });
    });
  }
}

module.exports = new Database(); 