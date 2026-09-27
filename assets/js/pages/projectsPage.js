import { renderNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';
import { createProjectCard } from '../components/projectCard.js';
import { createEmptyState } from '../components/emptyState.js';
import { clear } from '../utils/dom.js';
import { getAllProjects } from '../services/dataService.js';


async function init() {

    // Render the shared navbar.
    // "projects" makes Projects the active navigation item.
    renderNavbar('projects');


    const container =
        clear('#all-projects-container');


    if (!container) {

        console.error(
            'Could not find #all-projects-container'
        );

        return;
    }


    try {

        const projects =
            await getAllProjects();


        // Remove loading content.
        container.replaceChildren();


        if (
            !projects ||
            projects.length === 0
        ) {

            container.append(
                createEmptyState(
                    'No student projects have been published yet.'
                )
            );

            renderFooter();

            return;
        }


        // Render every project.
        projects.forEach(project => {

            const card =
                createProjectCard(
                    project,
                    {
                        showGroup: true,
                        admin: false
                    }
                );


            container.append(card);

        });


        renderFooter();

    }

    catch (error) {

        console.error(
            'PROJECTS PAGE ERROR:',
            error
        );


        container.replaceChildren();


        container.append(
            createEmptyState(
                'Projects could not be loaded.'
            )
        );


        renderFooter();

    }

}


init();