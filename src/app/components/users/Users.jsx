import { useState, useEffect } from "react";
import './users.css';

export const Users = () => {
  const [userList, setUserList] = useState([]);
  const [newUser, setNewUser] = useState({ name: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // Usuario en proceso de edición

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3002/users/');
        if (!response.ok) throw new Error('Error al obtener la lista de usuarios');
        const data = await response.json();
        setUserList(data);
      } catch (error) { console.error(error); }
    };
    fetchData();
  }, []);

  const handleInputChange = (event) => {
    setNewUser({ ...newUser, [event.target.name]: event.target.value });
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setNewUser({ name: user.name });
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setNewUser({ name: '' });
    setShowForm(false);
  };

  const handleDeleteClick = async (user) => {
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar a ${user.name}?`);
    if (confirmDelete) {
      try {
        const response = await fetch(`http://localhost:3002/users/deleteUsers/${user.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error al eliminar el usuario');
        const updatedData = await fetch('http://localhost:3002/users/').then((response) => response.json());
        setUserList(updatedData);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editingUser) {
        // Realizar una solicitud PUT para actualizar el usuario
        const response = await fetch(`http://localhost:3002/users/editUsers/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newUser),
        });
        if (!response.ok) throw new Error('Error al actualizar el usuario');
      } else {
        // Realizar una solicitud POST para agregar un nuevo usuario
        const response = await fetch('http://localhost:3002/users/addUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newUser),
        });
        if (!response.ok) throw new Error('Error al agregar el usuario');
      }

      const updatedData = await fetch('http://localhost:3002/users/').then((response) => response.json());
      setUserList(updatedData);
      setEditingUser(null);
      setNewUser({ name: '' });
      setShowForm(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Acciones</th> {/* Nueva columna para los botones de acción */}
          </tr>
        </thead>
        <tbody>
          {userList.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{editingUser === user ? (
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                  />
                </form>
              ) : user.name}</td>
              <td>
                {editingUser === user ? (
                  <div className="bot-edit">
                    <button type="button" onClick={handleCancelEdit} className="btn-cancel">Cancelar</button>
                    <button type="submit" onClick={handleSubmit} className="btn-save">Guardar Cambios</button>
                  </div>
                ) : (
                  <div className="bot-mod">
                    <button onClick={() => handleEditClick(user)} className="btn-modify">Modificar</button>
                    <button onClick={() => handleDeleteClick(user)} className="btn-delete">Eliminar</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={() => setShowForm(!showForm)} className="btn-add">Agregar Usuario</button>
      {showForm && (
        <form onSubmit={handleSubmit}>
          <h2>Agregar Usuario</h2>
          <label>
            Nombre:
            <input type="text" name="name" value={newUser.name} onChange={handleInputChange} />
          </label>
          <button type="submit">Agregar</button>
        </form>
      )}
    </div>
  );
};
