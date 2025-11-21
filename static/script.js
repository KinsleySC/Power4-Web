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
    
    // Ajouter cette fonction après findLowestEmptyCell
    function calculateDropDistance() {
        const tableTop = table.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        return Math.max(windowHeight - tableTop, 1000); // Au moins 1000px ou la distance jusqu'en haut
    }

    table.addEventListener('mouseover', (e) => {
        const cell = e.target;
        if (cell.tagName === 'TD') {
            // Vérifier si le jeu est terminé
            const statusText = document.querySelector('.status').textContent;
            if (statusText.includes('gagné') || statusText.includes('Match nul')) {
                return;
            }

            const column = e.target.closest('td').dataset.column;
            const currentPlayer = document.querySelector('.status').textContent.includes('joueur 1') ? 1 : 2;

            // Supprimer tous les effets hover précédents
            document.querySelectorAll('.hover-effect-1, .hover-effect-2').forEach(el => {
                el.classList.remove('hover-effect-1', 'hover-effect-2');
            });

            // Trouver la cellule la plus basse dans la colonne
            let lowestEmpty = null;
            const cells = document.querySelectorAll(`td[data-column="${column}"]`);
            for (let i = cells.length - 1; i >= 0; i--) {
                if (!cells[i].classList.contains('player1') && !cells[i].classList.contains('player2')) {
                    lowestEmpty = cells[i];
                    break;
                }
            }

            // Ajouter l'effet hover à la cellule la plus basse vide
            if (lowestEmpty) {
                lowestEmpty.classList.add(`hover-effect-${currentPlayer}`);
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
                        const dropDistance = calculateDropDistance();
                        
                        // Nettoyer d'abord toutes les classes
                        lowestCell.className = '';
                        
                        // Définir la variable CSS personnalisée pour la distance
                        lowestCell.style.setProperty('--drop-distance', `${dropDistance}px`);
                        
                        // Ajouter les nouvelles classes dans le bon ordre
                        lowestCell.classList.add(`player${currentPlayer}`);
                        lowestCell.classList.add('dropping');
                        
                        setTimeout(() => {
                            lowestCell.classList.remove('dropping');
                        }, 600); // Réduit de 800ms à 600ms

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