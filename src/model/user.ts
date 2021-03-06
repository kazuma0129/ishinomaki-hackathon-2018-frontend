
import { db, firebase } from '../lib/firebase'
import Project from './project'

export default class User {
  /* eslint-disable */
  uid?: string;
  photo_url?: string;
  name?: string;
  nickname?: string;
  role?: string;
  skill?: string;
  organization?: string;
  purpose?: string;
  note?: string;
  join_project_uid?: string;
  /* eslint-enable */

  constructor (json: firebase.firestore.DocumentData) {
    Object.assign(this, json)
  }

  public static async create (param: { uid: string, photo_url?: string }): Promise<User> {
    const user = new User(param)
    const obj = Object.assign({}, user)
    await db.collection('users').doc(param.uid).set(obj, { merge: true })
    return user
  }

  public static async findByUid (uid: string): Promise<User> {
    const doc = await db.collection('users').doc(uid).get()
    const data = doc.data()

    if (!data) { throw new Error('userが見つかりませんでした') }
    return new User(data)
  }

  public async joinProject (projectUid: string): Promise<void> {
    if (!this.uid) { return }

    if (this.join_project_uid) {
      const oldProject = await Project.findByProjectId(this.join_project_uid)
      await oldProject.removeMember(this.uid)
    }

    const newProject = await Project.findByProjectId(projectUid)
    await newProject.addMember(this)

    await db.collection('users').doc(this.uid).set({
      join_project_uid: projectUid
    }, { merge: true })
  }
}
