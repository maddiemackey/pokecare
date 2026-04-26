import { useState, useEffect } from 'react';
import './ToDo.css';
import { CornerDownLeft } from 'lucide-react';
import type { Todo } from '../../types/Todo';
import { supabase } from "../../../supabase/supabaseClient";
import type { User } from "@supabase/supabase-js";
import type { Pokemon } from '../../types/Pokemon';
import { getXPIntoLevel } from '../xp/XP';

type ToDoProps = {
  user: User;
  activePokemon: Pokemon;
  todoItems: Todo[];
  setTodoItems: React.Dispatch<React.SetStateAction<Todo[]>>;
};

export default function ToDo({ user, activePokemon, todoItems, setTodoItems }: ToDoProps) {
  const [todoNew, setTodoNew] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch todos on component mount or when user changes
  useEffect(() => {
    const fetchTodos = async () => {
      setLoading(true);
      const date = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("todo")
        .select("*")
        .or(`completed_at.is.null,completed_at.gte.${date}`)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching todos:", error);
      } else {
        setTodoItems(data || []);
      }
      setLoading(false);
    };

    if (user) {
      fetchTodos();
    }
  }, [user, setTodoItems]);

  const toggleTodo = async (id: string) => {
    // Find the current item before any updates
    const currentItem = todoItems.find(item => item.id === id);
    if (!currentItem) return;

    // Compute the new completed value
    const newCompleted = !currentItem.completed;

    // If task is completed, add XP to the active Pokémon
    if (newCompleted) {
      const xpGain = 10;
      // If they level up and evolve, update pokemon
      const newXP = activePokemon.current_xp + xpGain;
      let updateSpecies = activePokemon.species;
      const { level, xpIntoLevel, xpNeeded } = getXPIntoLevel(newXP);
      const evolutionLevel = activePokemon.evolution?.[0].details[0].minLevel
      if (evolutionLevel && level >= evolutionLevel) {
        updateSpecies = activePokemon.evolution?.[0]?.speciesName || updateSpecies;
      }

      const { error } = await supabase
        .from("user_pokemon")
        .update({ current_xp: newXP, species: updateSpecies })
        .eq("id", activePokemon.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating Pokémon XP:", error);
      } else {
        activePokemon.current_xp = newXP;
      }
    }

    // Update todo in database
    const { error } = await supabase
      .from("todo")
      .update({ completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : null })
      .eq("id", id);

    if (error) {
      console.error("Error updating todo:", error);
      // Optionally show a user error or revert
    } else {
      // Update local state only on DB success
      setTodoItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, completed: newCompleted }
            : item
        )
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoNew.trim()) return;

    const { data, error } = await supabase
      .from("todo")
      .insert([{ text: todoNew, completed: false, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error("Error adding To Do item:", error);
      return;
    }

    if (data) {
      setTodoItems((prev) => [...prev, data as Todo]);
      setTodoNew('');
    }
  };

  if (loading) {
    return <div>Loading todos...</div>;
  }

  return (
    <div className="todo-component">
      <h2>To-Do List</h2>

      <div className="todo-items">
        {todoItems.map((item) => (
          <label
            key={item.id}
            className={`todo-item ${item.completed ? 'completed' : ''}`}
          >
            <input
              type="checkbox"
              className="todo-checkbox"
              checked={item.completed}
              onChange={() => toggleTodo(item.id)}
            />
            <span className="todo-text">
              {item.text}
            </span>
          </label>
        ))}
        <form className="todo-new-container" onSubmit={handleSubmit}>
          <input
            type="checkbox"
            className="todo-checkbox"
            disabled={true}
          />
          <input
            type="text"
            value={todoNew}
            onChange={(e) => setTodoNew(e.target.value)}
            className="todo-new"
          />
          <CornerDownLeft />
        </form>
      </div>
    </div>
  );
}
