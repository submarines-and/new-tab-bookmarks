import React from 'react';
import ReactDOM from 'react-dom';

type Bookmark = chrome.bookmarks.BookmarkTreeNode;

interface State {
  bookmarks: Bookmark[]
  selectedFolder: Bookmark;
}

class Bookmarks extends React.Component<any, State> {

  public async componentDidMount() {

    const bookmarks: Bookmark[] = await new Promise((resolve) => chrome.bookmarks.getTree(bookmarks => resolve(bookmarks[0]?.children[0]?.children as any)));

    this.setState({ bookmarks });
  }

  public render() {

    return (
      <div className='d-flex align-items-center h-100 container'>
        {this.state?.bookmarks && <div>

          <div className='d-flex align-items-center mb-3' onClick={(event) => this.openFolder(event)}>
            <h3 className='mb-0'>{this.state?.selectedFolder?.title || 'Favorites'}</h3>
            {this.state?.selectedFolder && <button type='button' className='btn btn-dark ml-2'>Back</button>}
          </div>

          {this.renderBookmarksRecursive(this.state?.selectedFolder?.children || this.state.bookmarks)}

        </div>}
      </div>
    );
  }

  private renderBookmarksRecursive(bookmarks: Bookmark[]) {
    return (
      <div className='row m-0 flex-wrap'>

        {bookmarks?.map(bookmark => (
          <a href={bookmark.url} className='text-decoration-none mr-3 mb-4' >

            <div className='d-flex align-items-center border rounded mb-2' style={{ height: 100, width: 100 }} onClick={(event) => this.openFolder(event, bookmark)}>
              {bookmark.url && <img className='mx-auto' height='24' width='24' src={`http://www.google.com/s2/favicons?domain=${bookmark.url}`} />}
              {!bookmark.url && this.renderFolderIcons(bookmark)}
            </div>

            <small className='d-block text-dark text-center text-wrap' style={{ width: 100 }}>{bookmark.title}</small>
          </a>
        ))}
      </div>
    );
  }

  /** For folders, show contained items in a grid  */
  private renderFolderIcons(folder: Bookmark) {
    return (
      <div className='d-flex flex-wrap'>
        {folder.children.map(bookmark => <img className='mr-1 mb-1' height='16' width='16' src={`http://www.google.com/s2/favicons?domain=${bookmark.url}`} />)}
      </div>
    );
  }

  /** Choose which folder to view */
  private openFolder(event: React.MouseEvent, bookmark?: Bookmark): void {
    event.preventDefault();

    if (!bookmark) {
      this.setState({ selectedFolder: null });
      return;
    }

    this.setState({ selectedFolder: bookmark.url ? null : bookmark });
  }

}

ReactDOM.render(<Bookmarks />, document.getElementById('app'));
