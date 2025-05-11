class Gist {
  id;
  author;
  created_at;
  description;
  files;

  constructor(id, author, created_at, description, files) {
    this.id = id;
    this.author = author;
    this.created_at = created_at;
    this.description = description;
    this.files = files;
  }

  static async load(id) {
    const response = await fetch(new URL(id, "https://api.github.com/gists/"));

    if (!response.ok) {
      throw new Error("Couldn't load gist (invalid or private)");
    }

    const data = await response.json();
    const files = new Map(Object.entries(data.files).map(([name, details]) => [name, details.content]));

    return new Gist(
      data.id,
      data.owner.login,
      data.created_at,
      data.description,
      files,
    );
  }
}