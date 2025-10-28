package main

import (
	"html/template"
	"log"
	"net/http"
)

const (
	rows    = 6
	columns = 7
)

type Game struct {
	Board    [][]int
	Current  int // Joueur courant (1 ou 2)
	Winner   int // 0 = pas de gagnant, 1 ou 2 = gagnant
	GameOver bool
}

var (
	tmpl = template.Must(template.ParseFiles("templates/index.html"))
	game = NewGame()
)

func NewGame() *Game {
	board := make([][]int, rows)
	for i := range board {
		board[i] = make([]int, columns)
	}
	return &Game{
		Board:    board,
		Current:  1,
		Winner:   0,
		GameOver: false,
	}
}

func (g *Game) CheckWin(row, col int) bool {
	player := g.Board[row][col]

	directions := [][2]int{
		{0, 1},  // horizontal
		{1, 0},  // vertical
		{1, 1},  // diagonale descendante
		{1, -1}, // diagonale montante
	}

	for _, d := range directions {
		count := 1
		for i := 1; i < 4; i++ {
			r := row + d[0]*i
			c := col + d[1]*i
			if r < 0 || r >= rows || c < 0 || c >= columns || g.Board[r][c] != player {
				break
			}
			count++
		}
		for i := 1; i < 4; i++ {
			r := row - d[0]*i
			c := col - d[1]*i
			if r < 0 || r >= rows || c < 0 || c >= columns || g.Board[r][c] != player {
				break
			}
			count++
		}
		if count >= 4 {
			return true
		}
	}
	return false
}

func (g *Game) IsDraw() bool {
	for c := 0; c < columns; c++ {
		if g.Board[0][c] == 0 {
			return false
		}
	}
	return true
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	draw := game.GameOver && game.Winner == 0

	data := struct {
		Board    [][]int
		Current  int
		Winner   int
		GameOver bool
		Draw     bool
		Columns  []int
	}{
		Board:    game.Board,
		Current:  game.Current,
		Winner:   game.Winner,
		GameOver: game.GameOver,
		Draw:     draw,
		Columns:  make([]int, columns),
	}
	for i := 0; i < columns; i++ {
		data.Columns[i] = i
	}

	err := tmpl.Execute(w, data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func playHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	if game.GameOver {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	err := r.ParseForm()
	if err != nil {
		http.Error(w, "Erreur lors de l'analyse du formulaire", http.StatusBadRequest)
		return
	}
	column := r.FormValue("column")

	log.Println("Columnù6 play :", column)

	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func resetHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		game = NewGame()
	}
	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func main() {
	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/play", playHandler)
	http.HandleFunc("/reset", resetHandler)

	fs := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	log.Println("Serveur démarré sur http://localhost:8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal(err)
	}
}
