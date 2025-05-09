import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from "react-bootstrap";
import { Navigate, Route, Routes } from "react-router-dom";
import { NewNote } from "./NewNote";
import { NoteList } from "./NoteList";
import { NoteLayout } from "./NoteLayout";
import { useLocalStorage } from "./LocalStorage";
import { useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { Note } from "./Note";
import { EditNote } from "./EditNote";
export type RawNote = {
  id: string;
} & RawNoteData;

export type RawNoteData = {
  title: string;
  markdown: string;
  tagIds: string[];
};

export type Note = {
  id: string;
} & NoteData;

export type NoteData = {
  title: string;
  markdown: string;
  tags: Tag[];
};
export type Tag = {
  id: string;
  label: string;
};
function App() {
  const [notes, setNotes] = useLocalStorage<RawNote[]>("NOTES", []);
  const [tags, setTags] = useLocalStorage<Tag[]>("TAGS", []);
  const notesWithTags = useMemo(() => {
    return notes.map((note) => {
      return {
        ...note,
        tags: tags.filter((tag) => note.tagIds.includes(tag.id)),
      };
    });
  }, [notes, tags]);
  function onCreateNote({ tags, ...data }: NoteData) {
    setNotes((prevNotes) => {
      return [
        ...prevNotes,
        {
          ...data,
          id: uuidv4(),
          tagIds: tags.map((tag) => tag.id),
        },
      ];
    });
  }
  function onUpdateNote(id: string, { tags, ...data }: NoteData) {
    setNotes((prevNotes) => {
      return prevNotes.map((note) => {
        if (note.id === id)
          return {
            ...note,
            ...data,
            tagIds: tags.map((tag) => tag.id),
          };
        else return note;
      });
    });
  }
  function onDeleteNote(id: string) {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
  }
  function onAddTag(newTag: Tag) {
    setTags((prevTags) => [...prevTags, newTag]);
  }
  function onDeleteTag(id: string) {
    setTags((prevTags) => prevTags.filter((tag) => tag.id !== id));
  }
  function onUpdateTag(label: string, id: string) {
    setTags((prevTag) =>
      prevTag.map((tag) => (tag.id === id ? { ...tag, label } : tag))
    );
  }
  return (
    <Container className="my-4">
      <Routes>
        <Route
          path="/"
          element={
            <NoteList
              notes={notesWithTags}
              availableTags={tags}
              onUpdateTag={onUpdateTag}
              onDeleteTag={onDeleteTag}
            ></NoteList>
          }
        />
        <Route
          path="/new"
          element={
            <NewNote
              onSubmit={onCreateNote}
              onAddTag={onAddTag}
              availableTags={tags}
            />
          }
        />
        <Route
          path="/:id"
          element={<NoteLayout notes={notesWithTags}></NoteLayout>}
        >
          <Route index element={<Note onDelete={onDeleteNote}></Note>} />
          <Route
            path="edit"
            element={
              <EditNote
                onSubmit={onUpdateNote}
                onAddTag={onAddTag}
                availableTags={tags}
              ></EditNote>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Container>
  );
}

export default App;
