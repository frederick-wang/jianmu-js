// create a new class extends File to add path property and webkitRelativePath property
class JMFile extends File {
  path: string
  webkitRelativePath: string
  constructor(
    fileBits: BlobPart[],
    fileName: string,
    options: FilePropertyBag & { path: string; webkitRelativePath: string }
  ) {
    super(fileBits, fileName, options)
    this.path = options.path
    this.webkitRelativePath = options.webkitRelativePath
  }
}

export default JMFile
