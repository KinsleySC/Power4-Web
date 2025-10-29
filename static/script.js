document.addEventListener('DOMContentLoaded', () => {
    const table = document.querySelector('table');
    const rows = table.querySelectorAll('tr');
    
    // Fonction pour trouver la cellule disponible la plus basse dans une colonne
    function findLowestEmptyCell(colIndex) {
        for (let rowIndex = rows.length - 1; rowIndex >= 0; rowIndex--) {
            const cell = rows[rowIndex].children[colIndex];
            if (!cell.classList.contains('player1') && !cell.classList.contains('player2')) {
                return cell;
            }
        }
        return null;
    }
    
    // Gestionnaire de survol
    table.addEventListener('mouseover', (e) => {
        const cell = e.target;
        if (cell.tagName === 'TD') {
            // Supprimer l'effet de tous les éléments
            document.querySelectorAll('.hover-effect').forEach(el => {
                el.classList.remove('hover-effect');
            });
            
            const colIndex = cell.cellIndex;
            const lowestCell = findLowestEmptyCell(colIndex);
            if (lowestCell) {
                lowestCell.classList.add('hover-effect');
            }
        }
    });
    
    // Supprimer l'effet quand la souris quitte le tableau
    table.addEventListener('mouseleave', () => {
        document.querySelectorAll('.hover-effect').forEach(el => {
            el.classList.remove('hover-effect');
        });
    });
    
    // Gestionnaire de clic - Version formulaire simple
    table.addEventListener('click', (e) => {
        const cell = e.target;
        if (cell.tagName === 'TD') {
            const column = cell.dataset.column;
            
            // Créer un formulaire et le soumettre
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '/play';
            
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'column';
            input.value = column;
            
            form.appendChild(input);
            document.body.appendChild(form);
            form.submit();
        }
    });
});