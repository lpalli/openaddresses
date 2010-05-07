import os,sys
import time

# Get all files ending by .ini
def getInFiles(inFiles,path):
    names = os.listdir(path)
    for name in names:
        if os.path.isfile(path+'/'+name):
            if name.endswith('.in') and name != 'MANIFEST.in':
                inFiles.append(path+'/'+name)
        if os.path.isdir(path+'/'+name):
            getInFiles(inFiles,path+'/'+name)

# Get configuration information from the provided file
def getConfig(filename):
    config={}
    f = open(filename, 'r')
    for line in f:
        kvp = line.split("=",1)
        if len(kvp) == 2:
            config[kvp[0]]= kvp[1]
    return config

# Replace configuration by values
def replaceConfig(filename,config):
    file = open(filename, 'r')
    newFilename =  filename[0:len(filename)-3]
    outputFile = open(newFilename,'w+')
    for line in file:
        splitString = line.split('%');
        newLine = ''
        if len(splitString) == 3:
            if config.get(splitString[1]) is not None:
                newLine=line.replace('%'+splitString[1]+'%',config.get(splitString[1]).replace('\n',''))
                outputFile.write(newLine)
        elif len(splitString) == 5:
            newLine = line
            if config.get(splitString[1]) is not None:
                newLine=newLine.replace('%'+splitString[1]+'%',config.get(splitString[1]).replace('\n',''))
            if config.get(splitString[3]) is not None:
                newLine=newLine.replace('%'+splitString[3]+'%',config.get(splitString[3]).replace('\n',''))
            outputFile.write(newLine)
        else:
            outputFile.write(line)
        if filename.find('development.ini.in') > 0:
            if line.find('app:main') > 0:
               outputFile.write('versionTime=' + str(time.time()) + "\n")

    file.close()
    outputFile.close();

# Start programm 
print "Starting deploy. Example: python deploy.py config/myconfig.cfg"

# svn update
print "SVN update..."
os.system("svn up")

# Replace .in files
print "Config file replacement..."
inFiles=[]

getInFiles(inFiles,os.getcwd())

config = getConfig(sys.argv[1])

for inFile in inFiles:
    print 'Replace file: '+inFile
    replaceConfig(inFile,config)

# Build javascript
print "Build Javascript..."
os.system("cd jsbuild;../../../env/bin/jsbuild -o ../openaddresses/public/build app.cfg")

# Translate server
print "Compile catalog"
os.system("../../env/bin/python setup.py compile_catalog")

# Restart apache
print "Restart apache..."
os.system("sudo /etc/init.d/apache2 restart")

print "Deploy finished"
