import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Play, Settings, Copy, ExternalLink, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Instructions() {
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    console.log('=== INSTRUCTIONS PAGE MOUNT ===');
    console.log('Scrolling to top of page');
    window.scrollTo(0, 0);
    console.log('=== END INSTRUCTIONS PAGE MOUNT ===');
  }, []);

  const sampleScripts = [
    {
      title: "Text Replacement",
      description: "Replace abbreviations with full text",
      code: "::btw::by the way\n::omg::oh my god\n::brb::be right back",
      explanation: "The :: syntax creates text replacements. When you type 'btw' followed by a space or punctuation, it automatically expands to 'by the way'."
    },
    {
      title: "Window Management",
      description: "Quickly arrange windows on your screen",
      code: "^!Left::WinMove, A,, 0, 0, A_ScreenWidth/2, A_ScreenHeight\n^!Right::WinMove, A,, A_ScreenWidth/2, 0, A_ScreenWidth/2, A_ScreenHeight",
      explanation: "Ctrl+Alt+Left moves the active window to the left half of the screen, Ctrl+Alt+Right moves it to the right half."
    },
    {
      title: "Application Launcher",
      description: "Launch applications with custom hotkeys",
      code: "^j::Run, notepad.exe\n^k::Run, calc.exe\n^l::Run, chrome.exe",
      explanation: "Press Ctrl+J to open Notepad, Ctrl+K for Calculator, and Ctrl+L for Chrome browser."
    },
    {
      title: "Volume Control",
      description: "Control system volume with custom keys",
      code: "^Up::Send {Volume_Up 5}\n^Down::Send {Volume_Down 5}\n^m::Send {Volume_Mute}",
      explanation: "Ctrl+Up increases volume by 5 levels, Ctrl+Down decreases it, and Ctrl+M toggles mute."
    },
    {
      title: "Date and Time Insertion",
      description: "Insert current date and time anywhere",
      code: "^d::Send %A_YYYY%-%A_MM%-%A_DD%\n^t::Send %A_Hour%:%A_Min%:%A_Sec%",
      explanation: "Ctrl+D inserts the current date in YYYY-MM-DD format, Ctrl+T inserts the current time."
    }
  ];

  const commonCommands = [
    { command: "^j", description: "Ctrl + J" },
    { command: "!a", description: "Alt + A" },
    { command: "+s", description: "Shift + S" },
    { command: "#r", description: "Windows Key + R" },
    { command: "F1", description: "Function Key F1" },
    { command: "Space", description: "Spacebar" },
    { command: "Enter", description: "Enter Key" },
    { command: "Tab", description: "Tab Key" }
  ];

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          className="border-blue-500 text-blue-600 hover:bg-blue-50"
        >
          <Home className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">How to Use AutoHotkey Scripts</h1>
          <p className="text-gray-600 mt-1">Everything you need to know about running and using AutoHotkey</p>
        </div>
      </div>

      {/* Table of Contents */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Table of Contents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <a href="#what-is-autohotkey" className="text-blue-600 hover:text-blue-800 hover:underline">1. What is AutoHotkey?</a>
            <a href="#installation" className="text-blue-600 hover:text-blue-800 hover:underline">2. Installation Guide</a>
            <a href="#running-scripts" className="text-blue-600 hover:text-blue-800 hover:underline">3. Running Your Scripts</a>
            <a href="#common-commands" className="text-blue-600 hover:text-blue-800 hover:underline">4. Common Commands</a>
            <a href="#sample-scripts" className="text-blue-600 hover:text-blue-800 hover:underline">5. Sample Scripts</a>
            <a href="#editing-scripts" className="text-blue-600 hover:text-blue-800 hover:underline">6. Editing Scripts</a>
          </div>
        </CardContent>
      </Card>

      {/* What is AutoHotkey */}
      <Card id="what-is-autohotkey" className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-800">What is AutoHotkey?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            AutoHotkey is a powerful automation scripting language for Windows that allows you to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Create custom keyboard shortcuts and hotkeys</li>
            <li>Automate repetitive tasks and workflows</li>
            <li>Control windows, applications, and system functions</li>
            <li>Create text replacements and expansions</li>
            <li>Build simple GUIs and interactive scripts</li>
          </ul>
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <p className="text-blue-800 font-medium">Benefits for Productivity:</p>
            <p className="text-blue-700 mt-1">
              Save hours of manual work, reduce repetitive strain, and streamline your daily computer tasks with custom automation.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Installation Guide */}
      <Card id="installation" className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-800">Installation Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge className="bg-blue-100 text-blue-800 mt-1">1</Badge>
              <div>
                <p className="font-medium text-gray-800">Download AutoHotkey</p>
                <p className="text-gray-600 text-sm">Visit the official AutoHotkey website and download the latest version</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 border-green-500 text-green-600 hover:bg-green-50"
                  onClick={() => window.open('https://www.autohotkey.com/', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Download AutoHotkey
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge className="bg-blue-100 text-blue-800 mt-1">2</Badge>
              <div>
                <p className="font-medium text-gray-800">Run the Installer</p>
                <p className="text-gray-600 text-sm">Double-click the downloaded file and follow the installation wizard</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge className="bg-blue-100 text-blue-800 mt-1">3</Badge>
              <div>
                <p className="font-medium text-gray-800">Verify Installation</p>
                <p className="text-gray-600 text-sm">Right-click on your desktop and look for "New → AutoHotkey Script" in the context menu</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Running Scripts */}
      <Card id="running-scripts" className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-800">Running Your Scripts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Method 1: Double-Click</h3>
              <p className="text-gray-700 text-sm mb-2">Simply double-click any .ahk file to run it immediately.</p>
              <div className="bg-gray-50 p-3 rounded border-l-4 border-green-500">
                <p className="text-sm text-gray-700">✓ Easiest method for testing scripts</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Method 2: Windows Startup</h3>
              <p className="text-gray-700 text-sm mb-2">Add scripts to your Windows startup folder to run automatically when you log in.</p>
              <div className="bg-gray-900 p-3 rounded">
                <code className="text-green-400 text-sm">Windows + R → shell:startup → Copy your .ahk files here</code>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Method 3: Right-Click Menu</h3>
              <p className="text-gray-700 text-sm mb-2">Right-click any .ahk file and select "Compile Script" to create an .exe file.</p>
              <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                <p className="text-sm text-blue-800">💡 Compiled scripts can run on computers without AutoHotkey installed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Common Commands */}
      <Card id="common-commands" className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-800">Common AutoHotkey Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Hotkey Symbols</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {commonCommands.map((cmd, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <code className="font-mono text-sm bg-gray-200 px-2 py-1 rounded">{cmd.command}</code>
                    <span className="text-sm text-gray-600">{cmd.description}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Window Commands</h3>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded">
                  <code className="font-mono text-sm">WinActivate, Notepad</code>
                  <p className="text-sm text-gray-600 mt-1">Bring Notepad window to front</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <code className="font-mono text-sm">WinClose, Calculator</code>
                  <p className="text-sm text-gray-600 mt-1">Close Calculator window</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <code className="font-mono text-sm">WinMaximize, A</code>
                  <p className="text-sm text-gray-600 mt-1">Maximize the active window</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sample Scripts */}
      <Card id="sample-scripts" className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-800">Sample Scripts with Explanations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {sampleScripts.map((script, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{script.title}</h3>
                  <p className="text-sm text-gray-600">{script.description}</p>
                </div>
                <Button
                  onClick={() => handleCopy(script.code)}
                  size="sm"
                  variant="outline"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
              
              <div className="bg-gray-900 p-4 rounded mb-3">
                <pre className="text-green-400 text-sm font-mono overflow-x-auto">
                  {script.code}
                </pre>
              </div>
              
              <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                <p className="text-sm text-blue-800">
                  <strong>How it works:</strong> {script.explanation}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Editing Scripts */}
      <Card id="editing-scripts" className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-800">Editing Scripts Manually</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Basic Syntax Rules</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Each hotkey definition starts with the key combination followed by ::</li>
              <li>Commands are case-insensitive (Send and send work the same)</li>
              <li>Use semicolons (;) for comments</li>
              <li>End hotkey definitions with 'return'</li>
              <li>Strings should be enclosed in quotes when containing spaces</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Modifying Generated Scripts</h3>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-500">
                <p className="text-sm text-yellow-800">
                  <strong>Tip:</strong> Always test your modifications in a safe environment before using them in production.
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                <p className="text-sm text-green-800">
                  <strong>Best Practice:</strong> Keep backups of working scripts before making changes.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Troubleshooting Common Issues</h3>
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 rounded">
                <p className="font-medium text-gray-800">Script not working?</p>
                <p className="text-sm text-gray-600">Check if AutoHotkey is running in the system tray</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="font-medium text-gray-800">Hotkey conflicts?</p>
                <p className="text-sm text-gray-600">Some applications may override AutoHotkey hotkeys</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="font-medium text-gray-800">Syntax errors?</p>
                <p className="text-sm text-gray-600">AutoHotkey will show error messages when you run the script</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Back to Home */}
      <div className="text-center">
        <Button
          onClick={() => navigate('/')}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
        >
          <Home className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>
    </div>
  );
}