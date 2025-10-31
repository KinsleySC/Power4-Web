package main

import (
	"html/template"
	"log"
	"net/http"
	"strconv"
)

const (
	rows    = 6
	columns = 7
)

type Game struct {
	Board    [][]int
	Current  int
	Winner   int
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
		{0, 1},
		{1, 0},
		{1, 1},
		{1, -1},
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

	log.Printf("État actuel du plateau :")
	for i := 0; i < rows; i++ {
		log.Printf("%v", game.Board[i])
	}
}

func playHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	if game.GameOver {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	err := r.ParseForm()
	if err != nil {
		log.Printf("Erreur ParseForm: %v", err)
		http.Error(w, "Erreur lors de l'analyse du formulaire", http.StatusBadRequest)
		return
	}

	colStr := r.FormValue("column")
	log.Printf("Colonne reçue: %s", colStr)

	col, err := strconv.Atoi(colStr)
	if err != nil {
		log.Printf("Erreur de conversion: %v", err)
		http.Error(w, "Colonne invalide", http.StatusBadRequest)
		return
	}

	log.Printf("Tentative de jouer dans la colonne %d", col)

	placed := false
	for row := rows - 1; row >= 0; row-- {
		if game.Board[row][col] == 0 {

			game.Board[row][col] = game.Current
			log.Printf("Jeton placé en [%d,%d] pour le joueur %d", row, col, game.Current)
			placed = true

			if game.CheckWin(row, col) {
				game.Winner = game.Current
				game.GameOver = true
				log.Printf("Victoire du joueur %d", game.Current)
			} else if game.IsDraw() {
				game.GameOver = true
				log.Printf("Match nul")
			} else {

				game.Current = 3 - game.Current
				log.Printf("Au tour du joueur %d", game.Current)
			}
			break
		}
	}

	if !placed {
		log.Printf("Impossible de placer un jeton dans la colonne %d", col)
	}

	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func resetHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		game = NewGame()
	}
	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func main() {
	log.SetFlags(log.Lshortfile | log.LstdFlags)

	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/play", playHandler)
	http.HandleFunc("/reset", resetHandler)

	fs := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	log.Println("Routes configurées, serveur démarré sur http://localhost:8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal(err)
	}
}
