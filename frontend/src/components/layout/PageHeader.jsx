import PropTypes from 'prop-types';

// Shared top-of-page title block (title + optional subtitle + optional action,
// e.g. a "create new" button) - used by the browse/list pages (Home,
// WordListsBrowser, MyCrosswords, MyWordLists, FavoriteCrosswords,
// FavoriteWordLists) so title size/weight and spacing stay identical across
// them instead of drifting per page. Detail pages with their own card-header
// (Profile, WordListView) and the compact in-toolbar heading on the solver
// page are a different pattern and don't use this.
const PageHeader = ({ title, subtitle, action }) => (
    <div className="flex justify-between items-start wrap gap-2 mb-4">
        <div>
            <h1 className="heading-lg mb-1">{title}</h1>
            {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
        </div>
        {action}
    </div>
);

PageHeader.propTypes = {
    title: PropTypes.node.isRequired,
    subtitle: PropTypes.node,
    action: PropTypes.node,
};

export default PageHeader;
