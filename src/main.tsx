import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom';

type Bookmark = chrome.bookmarks.BookmarkTreeNode;

interface State {
  bookmarks: Bookmark[]
  selectedFolder: Bookmark;
}

class Bookmarks extends React.Component<any, State> {

  /** Load bookmarks */
  public async componentDidMount() {
    const bookmarks: Bookmark[] = await new Promise((resolve) => chrome.bookmarks.getTree(resolve));
    this.setState({ bookmarks: bookmarks[0]?.children[0]?.children });
  }

  public render() {
    return (
      <div className="h-100" style={{ backgroundColor: '#F0F0F0' }}>
        <div className='d-flex align-items-center h-75 container'>
          {this.state?.bookmarks && <div>

            <div className='d-flex align-items-center mb-3' onClick={() => this.setState({ selectedFolder: null })}>
              <h3 className='mb-0'>{this.state?.selectedFolder?.title || 'Bookmarks'}</h3>
              {this.state?.selectedFolder && <button type='button' className='btn btn-dark ml-2'>Back</button>}
            </div>

            <div className='row m-0 flex-wrap'>

              {!this.state.bookmarks.length && <div className='text-muted'>You have no bookmarks</div>}

              {(this.state?.selectedFolder?.children || this.state.bookmarks)?.map(bookmark => (
                <a role="button" href={bookmark.url} className='text-decoration-none mr-3 mb-4' >

                  <div className='d-flex align-items-center border rounded mb-2' style={{ height: 100, width: 100 }} onClick={(event) => this.openFolder(event, bookmark)}>
                    {bookmark.url && <img className='mx-auto' height='24' width='24' src={`http://www.google.com/s2/favicons?domain=${bookmark.url}`} />}
                    {!bookmark.url && <div className='d-flex flex-wrap p-1'>
                      {bookmark.children.map(b => <img className='mr-1 mb-1' height='16' width='16' src={`http://www.google.com/s2/favicons?domain=${b.url}`} />)}
                    </div>}
                  </div>

                  <small className='d-block text-dark text-center text-wrap' style={{ width: 100 }}>{bookmark.title}</small>
                </a>
              ))}
            </div>

          </div>}
        </div>
      </div>
    );
  }

  /**
   * Choose which folder to view.
   * @param event
   * @param bookmark technically a folder
   */
  private openFolder(event: React.MouseEvent, bookmark: Bookmark): void {
    if (bookmark.url) {
      return;
    }

    event.preventDefault();
    this.setState({ selectedFolder: bookmark });
  }

}

/** Start app  */
ReactDOM.render(<Bookmarks />, document.getElementById('app'));
