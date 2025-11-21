// Fonction pour démarrer le jeu
function startGame() {
    const startScreen = document.getElementById('startScreen');
    const gameContent = document.getElementById('gameContent');
    
    startScreen.style.display = 'none';
    gameContent.style.display = 'block';
    document.body.style.overflow = 'auto';
}

document.addEventListener('DOMContentLoaded', () => {
    const table = document.querySelector('table');
    const rows = table.querySelectorAll('tr');
    
    function findLowestEmptyCell(colIndex) {
        for (let rowIndex = rows.length - 1; rowIndex >= 0; rowIndex--) {
            const cell = rows[rowIndex].children[colIndex];
            if (!cell.classList.contains('player1') && !cell.classList.contains('player2')) {
                return cell;
            }
        }
        return null;
    }
    

    table.addEventListener('mouseover', (e) => {
        const cell = e.target;
        if (cell.tagName === 'TD') {

            document.querySelectorAll('.hover-effect-1, .hover-effect-2').forEach(el => {
                el.classList.remove('hover-effect-1', 'hover-effect-2');
            });
            
            const colIndex = cell.cellIndex;
            const lowestCell = findLowestEmptyCell(colIndex);
            if (lowestCell) {
                const currentPlayer = document.querySelector('.status').textContent.includes('joueur 1') ? 1 : 2;
                lowestCell.classList.add(`hover-effect-${currentPlayer}`);
            }
        }
    });
    
    table.addEventListener('mouseleave', () => {
        document.querySelectorAll('.hover-effect-1, .hover-effect-2').forEach(el => {
            el.classList.remove('hover-effect-1', 'hover-effect-2');
        });
    });
    
    table.addEventListener('click', async (e) => {
        const cell = e.target;
        if (cell.tagName === 'TD') {
            // Vérifier si le jeu est terminé
            const statusText = document.querySelector('.status').textContent;
            if (statusText.includes('gagné') || statusText.includes('Match nul')) {
                return; // Arrêter si le jeu est terminé
            }

            const colIndex = cell.dataset.column;
            const lowestCell = findLowestEmptyCell(parseInt(colIndex));
            
            if (lowestCell) {
                try {
                    const response = await fetch('/play', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: `column=${colIndex}`,
                    });

                    if (response.ok) {
                        const currentPlayer = document.querySelector('.status').textContent.includes('joueur 1') ? 1 : 2;
                        
                        // Nettoyer d'abord toutes les classes
                        lowestCell.className = '';
                        
                        // Ajouter les nouvelles classes dans le bon ordre
                        lowestCell.classList.add(`player${currentPlayer}`);
                        lowestCell.classList.add('dropping');
                        
                        setTimeout(() => {
                            lowestCell.classList.remove('dropping');
                        }, 500);

                        const newDoc = await response.text();
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(newDoc, 'text/html');
                        
                        const newStatus = doc.querySelector('.status').innerHTML;
                        document.querySelector('.status').innerHTML = newStatus;
                    }
                } catch (error) {
                    console.error('Erreur:', error);
                }
            }
        }
    });
});