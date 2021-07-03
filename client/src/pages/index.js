import withSidebar from './withSidebar';

import HomePage from './Home';
import MyUploadsPage from './MyUploads';
import GroupDisplayPage from './GroupDisplay';
import UserPage from './User';
import ImageDisplayPage from './ImageDisplay';
import AddImagePage from './AddImage';
import SearchResultsPage from './SearchResults';

export {default as Routes} from './Routes';
export {default as Login} from './Login';
export {default as Register} from './Register';
export {default as Request} from './Request';
export {default as Reset} from './Reset';

export const Home = withSidebar(HomePage);
export const MyUploads = withSidebar(MyUploadsPage);
export const GroupDisplay = withSidebar(GroupDisplayPage);
export const User = withSidebar(UserPage);
export const ImageDisplay = withSidebar(ImageDisplayPage);
export const AddImage = withSidebar(AddImagePage);
export const SearchResults = withSidebar(SearchResultsPage);
