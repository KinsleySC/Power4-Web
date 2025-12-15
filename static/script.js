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
    function calculateDropDistance() {
        const tableTop = table.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        return Math.max(windowHeight - tableTop, 1000);
    }
    table.addEventListener('mouseover', (e) => {

        const cell = e.target;
        if (cell.tagName === 'TD') {
            const statusText = document.querySelector('.status').textContent;

            if (statusText.includes('gagné') || statusText.includes('Match nul')) {
                return;
            }
            const column = e.target.closest('td').dataset.column;
            const currentPlayer = document.querySelector('.status').textContent.includes('joueur 1') ? 1 : 2;

            document.querySelectorAll('.hover-effect-1, .hover-effect-2').forEach(el => {
                el.classList.remove('hover-effect-1', 'hover-effect-2');
            });
            let lowestEmpty = null;
            const cells = document.querySelectorAll(`td[data-column="${column}"]`);
            for (let i = cells.length - 1; i >= 0; i--) {
                if (!cells[i].classList.contains('player1') && !cells[i].classList.contains('player2')) {
                    lowestEmpty = cells[i];
                    break;
                }
            }
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

            const statusText = document.querySelector('.status').textContent;
            if (statusText.includes('gagné') || statusText.includes('Match nul')) {
                return;
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

                        lowestCell.className = '';

                        lowestCell.style.setProperty('--drop-distance', `${dropDistance}px`);

                        lowestCell.classList.add(`player${currentPlayer}`);
                        lowestCell.classList.add('dropping');
                        
                        setTimeout(() => {
                            lowestCell.classList.remove('dropping');
                        }, 600);

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
